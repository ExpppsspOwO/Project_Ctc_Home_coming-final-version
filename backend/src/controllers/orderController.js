const Order = require('../models/OrderModel');
const Souvenir = require('../models/SouvenirModel'); 
const SiteSetting = require('../models/SettingModel'); // ✅ 1. Import Setting เพื่อดึงเวลา
const Booking = require('../models/BookingModel'); // ✅ Import Booking (เพื่อเช็คสลิปซ้ำข้ามระบบ)
const axios = require('axios'); // ✅ เพิ่ม
const FormData = require('form-data'); // ✅ เพิ่ม
const fs = require('fs');

const createOrder = async (req, res) => {
    try {
        const { items } = req.body; 
        const userId = req.user?.id; 

        // ✅ 2. ดึงค่าเวลาจาก Setting มาคำนวณ
        let settings = await SiteSetting.findOne();
        if (!settings) settings = await SiteSetting.create({});

        // ถ้าไม่มีค่า ให้ default เป็น 60 นาที
        const minutesToAdd = settings.system.autoCancelMinutes || 60;

        const expireTime = new Date();
        expireTime.setMinutes(expireTime.getMinutes() + minutesToAdd);

        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in token' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'ตะกร้าสินค้าว่างเปล่า' });
        }

        let finalItems = [];
        let calculatedTotalPrice = 0;

        for (const item of items) {
            const product = await Souvenir.findById(item._id);

            if (!product) {
                return res.status(404).json({ message: `ไม่พบสินค้า ID: ${item._id}` });
            }

            if (!product.isAvailable) { 
                return res.status(400).json({ message: `สินค้า ${product.name} ไม่พร้อมใช้งาน` });
            }

            finalItems.push({
                souvenir: product._id,
                code: product.code || product._id.toString().slice(-6).toUpperCase(), 
                name: product.name,
                price: product.price, 
                image: product.image,
                quantity: item.quantity
                // ❌ ไม่ต้องใส่ expiresAt ในนี้ (ผิดที่)
            });

            calculatedTotalPrice += (product.price * item.quantity);
        }

        const newOrder = new Order({
            user: userId,
            items: finalItems,
            totalPrice: calculatedTotalPrice,
            status: 'pending',
            
            // ✅ 3. บันทึกเวลาหมดอายุลงไป (ระดับเดียวกับ status)
            expiresAt: expireTime 
        });

        await newOrder.save();

        res.status(201).json({
            message: 'สั่งซื้อสำเร็จ!',
            orderId: newOrder._id,
            totalPrice: calculatedTotalPrice,
            expiresAt: expireTime // ส่งกลับไปให้ frontend ใช้นับถอยหลังทันที
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสั่งซื้อ' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email') 
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { status };
        if (status === 'completed') {
            updateData.completedAt = new Date(); 
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!order) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const processOrderSlipBackground = async (orderId, filePath, filename, mimetype) => {
    try {
        console.log(`⏳ Background: Checking slip for Order ${orderId}...`);
        
        const order = await Order.findById(orderId);
        if (!order) return;

        // ดึงค่า Setting เพื่อเอามาเทียบ
        let setting = await SiteSetting.findOne();
        if (!setting) {
            console.warn("⚠️ ไม่พบการตั้งค่าเว็บไซต์ ข้ามการตรวจสอบชื่อ/เลขบัญชี");
        }

        // เตรียมส่งไป n8n
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('amount', order.totalPrice || 0);
        formData.append('file', fs.createReadStream(filePath), {
            filename: filename,
            contentType: mimetype
        });

        // ยิงไป n8n
        let slipResult;
        try {
            // 🚨 ตรวจสอบ URL n8n ให้ถูกต้อง
            const n8nUrl = 'http://n8n:5678/webhook/check-slip'; 
            const n8nResponse = await axios.post(n8nUrl, formData, {
                headers: { ...formData.getHeaders() }
            });
            slipResult = n8nResponse.data;
        } catch (n8nErr) {
            console.error("⚠️ Background n8n Error:", n8nErr.message);
            order.status = 'payment_failed';
            order.remark = 'ระบบตรวจสอบสลิปขัดข้องชั่วคราว (n8n Error)';
            await order.save();
            return;
        }

        // --- เริ่มการตรวจสอบ ---

        // 1. รูปผิด / อ่านไม่ได้
        if (slipResult.success !== true) {
            order.status = 'payment_failed';
            order.remark = slipResult.message || 'รูปภาพไม่ถูกต้อง หรือไม่มี QR Code';
            await order.save();
            return;
        }

        // 🔥 2. เช็คสลิปซ้ำ (TransRef) แบบเข้มข้น 🔥
        const transRef = slipResult.transRef || slipResult.transactionId || slipResult.ref1 || '';

        if (!transRef) {
            order.status = 'payment_failed';
            order.remark = 'ไม่พบรหัสอ้างอิง (Transaction ID) ในสลิป';
            await order.save();
            return;
        }

        // 2.1 เช็คใน Order (ยกเว้นตัวเอง)
        const existingOrder = await Order.findOne({ paymentRef: transRef, _id: { $ne: orderId } });
        if (existingOrder) {
            order.status = 'payment_failed';
            order.remark = `สลิปซ้ำ! ถูกใช้ไปแล้วในคำสั่งซื้อ #${existingOrder._id}`;
            await order.save();
            console.log(`❌ Duplicate Order Ref: ${transRef}`);
            return;
        }

        // 2.2 เช็คใน Booking (ป้องกันเอาสลิปจองโต๊ะมาซื้อของ)
        const existingBooking = await Booking.findOne({ paymentRef: transRef });
        if (existingBooking) {
            order.status = 'payment_failed';
            order.remark = `สลิปซ้ำ! ถูกใช้ไปแล้วในรายการจองโต๊ะ #${existingBooking.bookingRef || existingBooking._id}`;
            await order.save();
            console.log(`❌ Duplicate Booking Ref: ${transRef}`);
            return;
        }

        // 🔥 3. ตรวจสอบชื่อและเลขบัญชีปลายทาง (Receiver) 🔥
        if (setting && setting.payment) {
            const { accountNumber, accountName } = setting.payment;
            
            const slipReceiverAcc = slipResult.receiver?.proxy?.value || slipResult.receiver?.account?.value || ''; 
            const slipReceiverName = slipResult.receiver?.displayName || slipResult.receiver?.name || '';

            // --- Helper Functions ---
            const cleanAcc = (str) => String(str).replace(/[^0-9]/g, ''); 
            const cleanName = (str) => String(str).replace(/\s+/g, '').replace(/[^\wก-๙]/g, '').toLowerCase(); 

            // 3.1 เช็คเลขบัญชี
            if (accountNumber && cleanAcc(accountNumber) !== '') {
                const myAcc = cleanAcc(accountNumber);     
                const targetAcc = cleanAcc(slipReceiverAcc);

                if (targetAcc && !targetAcc.includes(myAcc) && !myAcc.includes(targetAcc)) {
                    order.status = 'payment_failed';
                    order.remark = `โอนผิดบัญชี: ปลายทางในสลิปคือ ${slipReceiverAcc}`;
                    await order.save();
                    console.log(`❌ Account Mismatch: DB=${myAcc} vs Slip=${targetAcc}`);
                    return;
                }
            }

            // 3.2 เช็คชื่อบัญชี (ตัดคำนำหน้า + เช็คสวนทาง)
            if (accountName && cleanName(accountName) !== '') {
                const removePrefix = (s) => s.replace(/^(นาย|นาง|นางสาว|ด\.ช\.|ด\.ญ\.|บริษัท|หจก\.|บจก\.)/, '');

                const myNameRaw = cleanName(accountName);
                const targetNameRaw = cleanName(slipReceiverName);

                const myName = removePrefix(myNameRaw);         
                const targetName = removePrefix(targetNameRaw); 

                const isMatch = (targetName.length > 5 && myName.includes(targetName)) || 
                                targetName.includes(myName);

                if (!isMatch) {
                    order.status = 'payment_failed';
                    order.remark = `ชื่อบัญชีไม่ตรง: ในสลิปคือ "${slipReceiverName}" (ระบบคาดหวัง "${accountName}")`;
                    await order.save();
                    console.log(`❌ Name Mismatch: DB=${myName} vs Slip=${targetName}`);
                    return;
                }
            }
        }

        // 4. ยอดเงิน
        const slipAmount = parseFloat(slipResult.amount || 0);
        const orderAmount = parseFloat(order.totalPrice || 0);

        if (slipAmount >= orderAmount - 1) { // อนุโลม 1 บาท
            // ✅ ผ่าน
            order.status = 'paid';
            order.paymentRef = transRef; // บันทึก Ref กันซ้ำ
            order.paidAt = new Date();
            order.remark = '';
            await order.save();
            console.log(`✅ Background: Order ${orderId} Paid!`);
        } else {
            // ❌ ยอดไม่ครบ
            order.status = 'payment_failed';
            order.remark = `ยอดเงินไม่ครบ (โอน ${slipAmount} / ต้องจ่าย ${orderAmount})`;
            await order.save();
            console.log(`❌ Background: Order ${orderId} Failed (Amount mismatch)`);
        }

    } catch (error) {
        console.error("Background Order Error:", error);
    }
};

const uploadSlip = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ message: 'กรุณาแนบรูปสลิป' });

        let order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });

        // 1. รับเรื่อง
        order.slipImage = req.file.filename;
        order.status = 'waiting_verify'; 
        await order.save();

        // 2. โยนงานไปทำเบื้องหลัง
        processOrderSlipBackground(id, req.file.path, req.file.filename, req.file.mimetype);

        // 3. ตอบกลับทันที
        return res.status(200).json({
            success: true,
            message: 'กำลังตรวจสอบสลิป...',
            order: order 
        });

    } catch (error) {
        console.error("Upload Slip Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ---------------------------------------------------------
// 🔥 ฟังก์ชันยกเลิก (แก้ไขเพิ่มรับ Remark)
// ---------------------------------------------------------
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role; 

        // ✅ 4. รับค่าเหตุผล (remark) จากหน้าเว็บ
        const { remark,status } = req.body;
        const targetStatus = status || 'cancelled';

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อนี้' });

        if (userRole !== 'admin' && userRole !== 'officer' && order.user.toString() !== userId) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขคำสั่งซื้อนี้' });
        }

        if (order.status === 'completed' || order.status === 'shipped') {
            return res.status(400).json({
                message: 'ไม่สามารถยกเลิกได้ เนื่องจากรายการสำเร็จไปแล้ว'
            });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: ไม่พบข้อมูลผู้ใช้' });
        }

        order.status = targetStatus;

        // ✅ 5. บันทึกเหตุผลลง Database
        if (remark) {
            order.remark = remark;
        } else {
            // กรณีไม่ได้ส่งมา ให้ใส่ Default ตามคนกด
           order.remark = (userRole === 'admin' || userRole === 'officer') 
                ? 'ยกเลิกโดยผู้ดูแลระบบ' 
                : 'ยกเลิกโดยผู้ใช้';
        }

        await order.save();

        res.json({ message: `อัปเดตสถานะเป็น ${targetStatus} เรียบร้อย`, order });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const bulkDeleteOrders = async (req, res) => {
    try {
        const { ids } = req.body; 
        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: 'ไม่พบรายการที่ต้องการลบ' });
        }
        await Order.deleteMany({ _id: { $in: ids } });
        res.json({ message: `ลบข้อมูล ${ids.length} รายการเรียบร้อย` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    uploadSlip,
    cancelOrder,
    bulkDeleteOrders,
    processOrderSlipBackground
}