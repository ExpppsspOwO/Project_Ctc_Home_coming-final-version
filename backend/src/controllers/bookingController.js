const mongoose = require('mongoose');
const Booking = require('../models/BookingModel');
const Order = require('../models/OrderModel');
const Table = require('../models/TableModels');
const User = require('../models/userModels');
const SiteSetting = require('../models/SettingModel');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
// ==========================================
// 📖 READ (ดูข้อมูลการจอง)
// ==========================================

// 1. ดูประวัติการจองของฉัน
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.find({ user: userId })
            .populate('tables.tableId')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. ดูรายการจองทั้งหมด (Admin Only)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('tables.tableId')
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// ✍️ TRANSACTION (จอง / จ่าย / ยกเลิก)
// ==========================================

// 3. จองโต๊ะ (Reserve)
const reserveTable = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { tables } = req.body;
        const userId = req.user.id;
        let settings = await SiteSetting.findOne();

        console.log("ค่าที่ได้จาก DB:", JSON.stringify(settings.system, null, 2));

        if (!settings) settings = await SiteSetting.create({}); // กันเหนียว

        // ดึงค่า autoCancelMinutes (ถ้าไม่มีให้ Default 60)
        const minutesToAdd = settings.system.autoCancelMinutes || 60;

        console.log("เวลาที่จะบวกเพิ่ม:", minutesToAdd); // ดูซิว่ามันใช้เลขอะไร

        if (!tables || tables.length === 0) throw new Error('กรุณาเลือกโต๊ะอย่างน้อย 1 โต๊ะ');

        const expireTime = new Date();
        expireTime.setMinutes(expireTime.getMinutes() + minutesToAdd);

        const selectedTablesData = [];
        let calculatedTotalPrice = 0;

        for (const tableId of tables) {
            const table = await Table.findById(tableId).session(session);
            if (!table) throw new Error(`ไม่พบโต๊ะ ID: ${tableId}`);
            if (table.status !== 'available') throw new Error(`โต๊ะ ${table.tableNumber} ถูกจองไปแล้ว`);

            table.status = 'booked';
            await table.save({ session });

            selectedTablesData.push({
                tableId: table._id,
                code: table.code, // ✅ ดึง Code มาเก็บด้วย (ถ้ามี)
                tableNumber: table.tableNumber,
                price: table.price,
                expiresAt: expireTime
            });

            calculatedTotalPrice += table.price;
        }

        // ✅ สร้างเลขที่ใบจอง (Booking Ref) เช่น BK-123456-99
        const timestamp = Date.now().toString().slice(-6);
        const randomNum = Math.floor(Math.random() * 100);
        const bookingRef = `BK-${timestamp}-${randomNum}`;

        const newBooking = new Booking({
            bookingRef: bookingRef,
            user: userId,
            tables: selectedTablesData,
            totalPrice: calculatedTotalPrice,
            status: 'pending',
            expiresAt: expireTime
        });

        await newBooking.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'จองสำเร็จ!', booking: newBooking });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

// 4. ยกเลิกการจอง
const cancelReservation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const { remark,status } = req.body;
        const targetStatus = status || 'cancelled';

        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) throw new Error('ไม่พบรายการจอง');

        // เช็คสิทธิ์: ต้องเป็นเจ้าของ หรือ Admin เท่านั้น
       if (userRole !== 'admin' && userRole !== 'officer' && booking.user.toString() !== userId) {
            throw new Error('ไม่มีสิทธิ์ยกเลิก');
        }

        booking.status = targetStatus;
        booking.remark = remark || ''; //  ถ้าไม่มีส่งมา ให้ใส่ค่าว่าง
        await booking.save({ session });

        // คืนสถานะโต๊ะให้ว่าง
       if (targetStatus === 'cancelled') {
            if (booking.tables && booking.tables.length > 0) {
                for (const item of booking.tables) {
                    await Table.findByIdAndUpdate(item.tableId, { status: 'available' }, { session });
                }
            } else if (booking.table) {
                await Table.findByIdAndUpdate(booking.table, { status: 'available' }, { session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.json({ message: `อัปเดตสถานะเป็น ${targetStatus} เรียบร้อย` });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};

// 5. อนุมัติการจ่ายเงิน (Admin)
const approvePayment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: 'verified', paymentDate: new Date() },
            { new: true }
        );

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // เปลี่ยนสถานะโต๊ะเป็น paid (สีแดงเข้ม/เทา)
        for (const item of booking.tables) {
            await Table.findByIdAndUpdate(item.tableId, { status: 'paid' });
        }

        res.json({ message: 'อนุมัติเรียบร้อย', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const processBookingSlipBackground = async (bookingId, filePath, filename, mimetype) => {
    try {
        console.log(`⏳ Background: Checking slip for Booking ${bookingId}...`);
        
        const booking = await Booking.findById(bookingId);
        if (!booking) return;

        // ดึงค่า Setting เพื่อเอามาเทียบ
        let setting = await SiteSetting.findOne();
        if (!setting) {
            console.warn("⚠️ ไม่พบการตั้งค่าเว็บไซต์ ข้ามการตรวจสอบชื่อ/เลขบัญชี");
        }

        // เตรียมส่งไป n8n
        const formData = new FormData();
        formData.append('bookingId', bookingId);
        formData.append('amount', booking.totalPrice || 0);
        formData.append('file', fs.createReadStream(filePath), {
            filename: filename,
            contentType: mimetype
        });

        // ยิงไป n8n
        let slipResult;
        try {
            // 🚨 ตรวจสอบ URL n8n ให้ถูกต้อง (localhost หรือ n8n)
            const n8nUrl = 'http://n8n:5678/webhook/check-slip'; 
            const n8nResponse = await axios.post(n8nUrl, formData, {
                headers: { ...formData.getHeaders() }
            });
            slipResult = n8nResponse.data;
        } catch (n8nErr) {
            console.error("⚠️ Background n8n Error:", n8nErr.message);
            booking.status = 'payment_failed';
            booking.remark = 'ระบบตรวจสอบสลิปขัดข้องชั่วคราว (n8n Error)';
            await booking.save();
            return;
        }

        // --- เริ่มการตรวจสอบ ---
        
        // 1. รูปผิด / อ่านไม่ได้
        if (slipResult.success !== true) {
            booking.status = 'payment_failed';
            booking.remark = slipResult.message || 'รูปภาพไม่ถูกต้อง หรือไม่มี QR Code';
            await booking.save();
            return;
        }

        // 🔥 2. เช็คสลิปซ้ำ (TransRef) แบบเข้มข้น 🔥
        // ต้องดึง Ref ออกมาก่อน (รองรับหลายชื่อตัวแปรจาก n8n)
        const transRef = slipResult.transRef || slipResult.transactionId || slipResult.ref1 || '';

        if (!transRef) {
            booking.status = 'payment_failed';
            booking.remark = 'ไม่พบรหัสอ้างอิง (Transaction ID) ในสลิป';
            await booking.save();
            return;
        }

        // 2.1 เช็คใน Booking (ยกเว้นตัวเอง)
        const duplicateBooking = await Booking.findOne({ 
            paymentRef: transRef,
            _id: { $ne: bookingId } 
        });
        if (duplicateBooking) {
            booking.status = 'payment_failed';
            booking.remark = `สลิปซ้ำ! ถูกใช้ไปแล้วในรายการจอง #${duplicateBooking.bookingRef || duplicateBooking._id}`;
            await booking.save();
            console.log(`❌ Duplicate Booking Ref: ${transRef}`);
            return;
        }

        // 2.2 เช็คใน Order (ป้องกันเอาสลิปซื้อของมาจองโต๊ะ)
        const duplicateOrder = await Order.findOne({ paymentRef: transRef });
        if (duplicateOrder) {
            booking.status = 'payment_failed';
            booking.remark = `สลิปซ้ำ! ถูกใช้ไปแล้วในคำสั่งซื้อสินค้า #${duplicateOrder._id}`;
            await booking.save();
            console.log(`❌ Duplicate Order Ref: ${transRef}`);
            return;
        }

        // 🔥 3. ตรวจสอบชื่อและเลขบัญชีปลายทาง (Receiver) 🔥
        if (setting && setting.payment) {
            const { accountNumber, accountName } = setting.payment;
            
            // ดึงข้อมูลจากสลิป (รองรับโครงสร้างที่ n8n อาจส่งมา)
            const slipReceiverAcc = slipResult.receiver?.proxy?.value || slipResult.receiver?.account?.value || ''; 
            const slipReceiverName = slipResult.receiver?.displayName || slipResult.receiver?.name || '';

            // --- Helper: ทำความสะอาดข้อมูล ---
            const cleanAcc = (str) => String(str).replace(/[^0-9]/g, ''); // เก็บแต่เลข
            const cleanName = (str) => String(str).replace(/\s+/g, '').replace(/[^\wก-๙]/g, '').toLowerCase(); // ตัดเว้นวรรค/อักขระพิเศษ

            // 3.1 เช็คเลขบัญชี (ถ้ามีใน Setting)
            if (accountNumber && cleanAcc(accountNumber) !== '') {
                const myAcc = cleanAcc(accountNumber);     
                const targetAcc = cleanAcc(slipReceiverAcc);

                // เช็คว่ามีเลขของเราอยู่ในสลิปไหม (ใช้ includes เผื่อเลขสลิปมีรหัสธนาคารติดมา)
                if (targetAcc && !targetAcc.includes(myAcc) && !myAcc.includes(targetAcc)) {
                    booking.status = 'payment_failed';
                    booking.remark = `เลขบัญชีไม่ตรง: ปลายทางคือ ${slipReceiverAcc}`;
                    await booking.save();
                    console.log(`❌ Account Mismatch: DB=${myAcc} vs Slip=${targetAcc}`);
                    return;
                }
            }

            // 3.2 เช็คชื่อบัญชี (ถ้ามีใน Setting)
            if (accountName && cleanName(accountName) !== '') {
                // ฟังก์ชันตัดคำนำหน้า (นาย, นาง, บจก. ฯลฯ)
                const removePrefix = (s) => s.replace(/^(นาย|นาง|นางสาว|ด\.ช\.|ด\.ญ\.|บริษัท|หจก\.|บจก\.)/, '');

                const myNameRaw = cleanName(accountName);
                const targetNameRaw = cleanName(slipReceiverName);

                const myName = removePrefix(myNameRaw);         // เช่น "สุภนันท์เลิศโอสถ"
                const targetName = removePrefix(targetNameRaw); // เช่น "สุภนันท์เ"

                // 🔥 เช็ค 2 ทาง (Bidirectional Check)
                // 1. สลิป มีชื่อเราผสมอยู่ (กรณีสลิปยาวกว่า)
                // 2. ชื่อเรา มีชื่อสลิปผสมอยู่ (กรณีสลิปโดนตัดคำจนสั้นกว่า)
                // *เพิ่มเงื่อนไข length > 5 เพื่อกันการตรงกันมั่วๆ กับชื่อสั้นๆ
                const isMatch = (targetName.length > 5 && myName.includes(targetName)) || 
                                targetName.includes(myName);

                if (!isMatch) {
                    booking.status = 'payment_failed';
                    booking.remark = `ชื่อบัญชีไม่ตรง: ในสลิปคือ "${slipReceiverName}" (ระบบคาดหวัง "${accountName}")`;
                    await booking.save();
                    console.log(`❌ Name Mismatch: DB=${myName} vs Slip=${targetName}`);
                    return;
                }
            }
        }

        // 4. ยอดเงิน
        const slipAmount = parseFloat(slipResult.amount || 0);
        const bookingAmount = parseFloat(booking.totalPrice || 0);

        // อนุโลมให้ขาดได้ไม่เกิน 1 บาท
        if (slipAmount >= bookingAmount - 1) { 
            // ✅ ผ่านฉลุย
            // อย่าลืมบันทึก paymentRef เพื่อกันการใช้ซ้ำในอนาคต!
            booking.status = 'verified'; 
            booking.paymentRef = transRef; 
            booking.paymentDate = new Date();
            booking.remark = ''; 
            
            if(booking.tables && booking.tables.length > 0) {
                 for (const item of booking.tables) {
                    await Table.findByIdAndUpdate(item.tableId, { status: 'paid' }); 
                }
            }
            await booking.save();
            console.log(`✅ Background: Booking ${bookingId} Verified!`);
        } else {
            // ❌ ยอดไม่ครบ
            booking.status = 'payment_failed';
            booking.remark = `ยอดเงินไม่ครบ (โอน ${slipAmount} / ต้องจ่าย ${bookingAmount})`;
            await booking.save();
            console.log(`❌ Background: Booking ${bookingId} Failed (Amount mismatch)`);
        }

    } catch (error) {
        console.error("Background Process Error:", error);
    }
};

// 6. อัปเดตสลิป (User)
const updateSlip = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!req.file) return res.status(400).json({ message: 'กรุณาแนบรูปสลิปโอนเงิน' });

        let booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'ไม่พบรายการจอง' });

        // 1. อัปเดต DB เป็น "รอตรวจสอบ" ทันที
        booking.slipImage = req.file.filename;
        booking.status = 'waiting_verify';
        booking.remark = ''; 
        await booking.save();

        // 2. 🔥 เรียกฟังก์ชันเบื้องหลัง (ไม่ต้องใส่ await) เพื่อให้ Code ไหลไปต่อเลย
        processBookingSlipBackground(bookingId, req.file.path, req.file.filename, req.file.mimetype);

        // 3. ตอบกลับ User ทันที ไม่ต้องรอ n8n
        return res.status(200).json({
            success: true,
            message: 'ได้รับสลิปแล้ว! ระบบกำลังตรวจสอบอัตโนมัติ โปรดกลับมาหน้านี้ภายหลัง',
            booking: booking
        });

    } catch (error) {
        console.error("Upload Slip Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Helper Function: จัดการเมื่อจ่ายไม่ผ่าน
async function handleBookingFail(booking, res, reason) {
    console.log(`❌ Booking Payment Failed: ${reason}`);
    booking.status = 'payment_failed';
    booking.remark = reason; // บันทึกเหตุผล
    await booking.save();

    return res.status(400).json({
        success: false,
        message: reason,
        booking: booking
    });
}

// 7. ย้ายโต๊ะ (Swap/Move Table)
const moveTable = async (req, res) => {
    try {
        const { bookingId, oldTableId, newTableId } = req.body;

        // 1. ตรวจสอบว่าโต๊ะปลายทาง (New) ว่างไหม?
        const newTable = await Table.findById(newTableId);
        if (!newTable || newTable.status !== 'available') {
            return res.status(400).json({ message: `โต๊ะปลายทาง (${newTable?.tableNumber || '?'}) ไม่ว่าง` });
        }

        // 2. ตรวจสอบใบจองเดิม
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'ไม่พบรายการจอง' });

        // 3. เริ่มการย้ายข้อมูล (Update DB)

        // 3.1 เปลี่ยนสถานะโต๊ะใหม่ -> booked
        newTable.status = 'booked';
        await newTable.save();

        // 3.2 เปลี่ยนสถานะโต๊ะเก่า -> available
        await Table.findByIdAndUpdate(oldTableId, { status: 'available' });

        // 3.3 อัปเดตข้อมูลในใบจอง (เปลี่ยน ID โต๊ะใน Array)
        // หา index ของโต๊ะเก่าใน list แล้วเปลี่ยนเป็นอันใหม่
        const tableIndex = booking.tables.findIndex(t => t.tableId.toString() === oldTableId);
        if (tableIndex !== -1) {
            booking.tables[tableIndex].tableId = newTable._id;
            booking.tables[tableIndex].tableNumber = newTable.tableNumber;
            // ถ้ามีการเปลี่ยนราคาด้วย ก็ต้องคำนวณ totalPrice ใหม่ตรงนี้
        }

        await booking.save();

        res.json({ message: `ย้ายจากโต๊ะเดิม ไปยัง ${newTable.tableNumber} เรียบร้อย`, booking });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. ล้างประวัติ (ลบทีละหลายรายการ)
const bulkDeleteBookings = async (req, res) => {
    try {
        const { ids } = req.body; // รับ Array ของ ID ที่จะลบ เช่น ["64a...", "64b..."]

        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: 'ไม่พบรายการที่ต้องการลบ' });
        }

        // --- 🛡️ Safety Zone: คืนสถานะโต๊ะก่อนลบ (กันเหนียว) ---
        // 1. หา Booking ทั้งหมดที่จะโดนลบ
        const bookingsToDelete = await Booking.find({ _id: { $in: ids } });

        // 2. วนลูปดูว่ามีอันไหนจองโต๊ะค้างไว้ไหม
        const tableIdsToFree = [];
        bookingsToDelete.forEach(booking => {
            // ถ้าสถานะยังไม่ยกเลิก และไม่ใช่ success (เช่น pending, verified)
            // เราควรรีเซ็ตโต๊ะให้ว่างก่อนลบ เพื่อไม่ให้โต๊ะค้างสถานะ booked
            if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
                if (booking.tables && booking.tables.length > 0) {
                    booking.tables.forEach(t => tableIdsToFree.push(t.tableId));
                }
            }
        });

        // 3. สั่งปลดล็อคโต๊ะเหล่านั้นให้ว่าง
        if (tableIdsToFree.length > 0) {
            await Table.updateMany(
                { _id: { $in: tableIdsToFree } },
                { $set: { status: 'available' } }
            );
        }
        // ----------------------------------------------------

        // 🚀 ลบข้อมูลจริงๆ (Hard Delete)
        await Booking.deleteMany({ _id: { $in: ids } });

        res.json({
            message: `ล้างข้อมูล ${ids.length} รายการเรียบร้อย`,
            deletedCount: ids.length
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBooking = async (req, res) => {
    try {
        const { username, phone, email, tables } = req.body;
        const bookingId = req.params.id;

        // 1. หา Booking เดิม
        const booking = await Booking.findById(bookingId).populate('tables');
        if (!booking) {
            return res.status(404).json({ message: 'ไม่พบรายการจอง' });
        }

        // 2. อัปเดตข้อมูลผู้จอง
        if (booking.user) {
            const userUpdate = {};
            if (username) userUpdate.username = username;
            if (phone) userUpdate.phone = phone;
            if (email) userUpdate.email = email;
            
            // เช็คว่า booking.user เป็น Object หรือ ID
            const userId = booking.user._id || booking.user;
            await User.findByIdAndUpdate(userId, userUpdate);
        }

        // 3. 🔥 จัดการย้ายโต๊ะ (Updated Logic)
        if (tables && Array.isArray(tables) && tables.length > 0) {
            
            // ✅ A. Sanitize: แกะ ID ออกมาให้ได้ แม้จะมาในรูปแบบแปลกๆ
            const cleanTableIds = tables.map(t => {
                if (typeof t === 'string') {
                    // ถ้าเป็น Hex String 24 ตัวอยู่แล้ว (Clean ID)
                    if (/^[0-9a-fA-F]{24}$/.test(t)) return t;

                    // ถ้าเป็น String หน้าตาเหมือน Object
                    try {
                        // ลอง Parse JSON ดูก่อน
                        const parsed = JSON.parse(t);
                        return parsed._id || parsed.tableId || parsed.id; 
                    } catch (e) { 
                        // ⚠️ ถ้า Parse ไม่ผ่าน (เช่นเคส new ObjectId(...)) ให้ใช้ Regex แกะหา ID
                        const matchObjectId = t.match(/ObjectId\(['"]([0-9a-fA-F]{24})['"]\)/);
                        if (matchObjectId) return matchObjectId[1];

                        const matchTableId = t.match(/tableId:\s*['"]?([0-9a-fA-F]{24})['"]?/);
                        if (matchTableId) return matchTableId[1];
                        
                        return null; // แกะไม่ได้จริงๆ
                    }
                }
                // ถ้าเป็น Object
                return t.tableId || t._id || t.id || t;
            }).filter(id => id && /^[0-9a-fA-F]{24}$/.test(id.toString())); // กรองเอาเฉพาะ ID ที่ถูกต้อง

            // ✅ B. คืนโต๊ะเก่าให้ว่าง
            // ต้องใช้ t.tableId เพราะ t คือ subdocument ใน booking
            const oldTableIds = booking.tables
                .map(t => (t.tableId ? t.tableId.toString() : (t._id ? t._id.toString() : t.toString())))
                .filter(id => /^[0-9a-fA-F]{24}$/.test(id));

            if (oldTableIds.length > 0) {
                await Table.updateMany(
                    { _id: { $in: oldTableIds } },
                    { $set: { status: 'available' } }
                );
            }

            // ✅ C. จองโต๊ะใหม่
            if (cleanTableIds.length > 0) {
                await Table.updateMany(
                    { _id: { $in: cleanTableIds } }, 
                    { $set: { status: 'booked' } } 
                );

                // ✅ D. อัปเดตข้อมูลใน Booking
                // ดึงข้อมูลโต๊ะล่าสุดมาใส่ (เพื่อให้มี tableNumber, price ครบถ้วนตาม Schema)
                const newTablesInfo = await Table.find({ _id: { $in: cleanTableIds } });
                
                const tableDataToSave = newTablesInfo.map(table => ({
                    tableId: table._id,
                    code: table.code,
                    tableNumber: table.tableNumber,
                    price: table.price
                }));

                booking.tables = tableDataToSave;
            }
        }

        await booking.save();
        
        // ส่งข้อมูลล่าสุดกลับไป
        const updatedBooking = await Booking.findById(bookingId)
            .populate('user')
            .populate('tables.tableId'); // Populate ให้ถูกต้อง

        res.json(updatedBooking);

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyBookings,
    getAllBookings,
    reserveTable,
    cancelReservation,
    approvePayment,
    updateSlip,
    moveTable,
    bulkDeleteBookings,
    updateBooking,
    processBookingSlipBackground
};