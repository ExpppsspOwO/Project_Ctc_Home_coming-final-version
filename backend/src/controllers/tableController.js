const mongoose = require('mongoose');
const Table = require('../models/TableModels');
const Booking = require('../models/BookingModel');

// ==========================================
// 📖 READ
// ==========================================

// 1. ดูโต๊ะทั้งหมด
const getTables = async (req, res) => {
    try {
        const tables = await Table.find().sort({ zone: 1, row: 1, column: 1 });
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. ดูโต๊ะเดียว
const getTableById = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) return res.status(404).json({ message: 'Table not found' });
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. ดูประวัติการจองของฉัน
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.find({ user: userId })
            .populate('tables.tableId') // ✅ Populate เข้าไปใน Array
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3.1 ดูรายการจองทั้งหมด (สำหรับ Admin)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('tables.tableId') // ✅ Populate เข้าไปใน Array
            .populate('user', '-password') // ดึง user แต่ไม่เอา password
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// ✍️ CREATE & ACTION (Transaction Zone 🛡️)
// ==========================================

// 4. จองโต๊ะ (Transaction แบบจองหลายโต๊ะ)
const reserveTable = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // ✅ เปลี่ยนมารับ tables (Array) จาก Body แทน
        const { tables } = req.body; 
        const userId = req.user.id;

        if (!tables || tables.length === 0) {
            throw new Error('กรุณาเลือกโต๊ะอย่างน้อย 1 โต๊ะ');
        }

        const selectedTablesData = [];
        let calculatedTotalPrice = 0;

        // วนลูปตรวจสอบและเตรียมข้อมูลทีละโต๊ะ
        for (const tableId of tables) {
            // ใช้ session เพื่อ lock ข้อมูล
            const table = await Table.findById(tableId).session(session);
            
            if (!table) throw new Error(`ไม่พบโต๊ะ ID: ${tableId}`);
            if (table.status !== 'available') throw new Error(`โต๊ะ ${table.tableNumber} ถูกจองไปแล้ว`);

            // เปลี่ยนสถานะโต๊ะ
            table.status = 'booked';
            await table.save({ session });

            // เก็บข้อมูลเข้า list
            selectedTablesData.push({
                tableId: table._id,
                tableNumber: table.tableNumber,
                price: table.price
            });

            calculatedTotalPrice += table.price;
        }

        // สร้างใบจองใบเดียว (แต่เก็บหลายโต๊ะ)
        // ⚠️ ต้องแน่ใจว่า BookingModel.js คุณแก้ tables เป็น Array แล้วนะ
        const newBooking = new Booking({
            user: userId,
            tables: selectedTablesData, 
            totalPrice: calculatedTotalPrice,
            status: 'pending'
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

// 5. ย้ายโต๊ะ (Move Table) - ฟังก์ชันที่หายไป (เติมให้แล้ว)
const moveTable = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    

    try {
        const { bookingId } = req.params;
        const { newTableId } = req.body;

        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) throw new Error('ไม่พบใบจอง');
        
        const oldTableId = booking.table;

        const newTable = await Table.findById(newTableId).session(session);
        if (!newTable || newTable.status !== 'available') {
            throw new Error('โต๊ะปลายทางไม่ว่าง');
        }

        // ปล่อยโต๊ะเก่า
        await Table.findByIdAndUpdate(oldTableId, { status: 'available' }, { session });
        // จองโต๊ะใหม่
        newTable.status = 'booked';
        await newTable.save({ session });
        // อัปเดตใบจอง
        booking.table = newTableId;
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ message: 'ย้ายโต๊ะเรียบร้อย' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};

// 6. อนุมัติการจ่ายเงิน (Approve) - ฟังก์ชันที่หายไป (เติมให้แล้ว)
const approvePayment = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // 1. อัปเดตใบจองเป็น verified (ตามที่เราคุยกันล่าสุด)
        const booking = await Booking.findByIdAndUpdate(
            bookingId, 
            { status: 'verified', paymentDate: new Date() }, // แก้สถานะใบจอง
            { new: true }
        );
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // 2. 🔥 สำคัญ! อัปเดตสถานะ "โต๊ะ" เป็น 'paid' ด้วย (เพื่อให้แสดงสีถูกต้องที่หน้าผัง)
        await Table.findByIdAndUpdate(booking.table, { status: 'paid' });
        // (Optional) ถ้าอยากให้สถานะโต๊ะเปลี่ยนเป็น 'paid' ด้วย ก็เพิ่มตรงนี้ได้
        // await Table.findByIdAndUpdate(booking.table, { status: 'paid' });

        res.json({ message: 'อนุมัติเรียบร้อย', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// 7. ยกเลิกการจอง (Transaction)
const cancelReservation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const booking = await Booking.findById(bookingId).populate('table').session(session);
        if (!booking) throw new Error('ไม่พบรายการจอง');

        if (userRole !== 'admin' && booking.user.toString() !== userId) {
            throw new Error('ไม่มีสิทธิ์ยกเลิก');
        }

        booking.status = 'cancelled';
        await booking.save({ session });

        if (booking.table) {
            await Table.findByIdAndUpdate(booking.table._id, { status: 'available' }, { session });
        }

        await session.commitTransaction();
        session.endSession();

        res.json({ message: 'ยกเลิกเรียบร้อย' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 🛠️ ADMIN TOOLS
// ==========================================

// 8. สร้างโซน (แก้ไขเพิ่ม code: Txxx)
const addZone = async (req, res) => {
    try {
        const { zoneName, rows, columns, price } = req.body;
        const [nRows, nCols] = [parseInt(rows) || 0, parseInt(columns) || 0];

        if (!zoneName || nRows < 1 || nCols < 1) {
            return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
        }

        // 🛑 Check Point สำคัญ: เช็คก่อนเลยว่ามีโซนนี้อยู่ในระบบไหม?
        const existingZone = await Table.findOne({ zone: zoneName });
        
        // ❌ ถ้าเจอว่ามีอยู่แล้ว แม้แต่ตัวเดียว -> หยุดทันที! แจ้งว่าซ้ำ
        if (existingZone) {
            return res.status(409).json({ 
                status: 'error', 
                message: `ไม่สามารถสร้างได้! โซน ${zoneName} มีอยู่ในระบบแล้ว (ถ้าต้องการเพิ่มโต๊ะ กรุณาใช้เมนูแก้ไข)` 
            });
        }

        // ✅ ถ้าผ่านมาถึงตรงนี้ แปลว่าโซนว่างแน่นอน (เริ่มนับ 1 ได้เลย)
        const tables = [];
        let counter = 1;

        for (let r = 1; r <= nRows; r++) {
            for (let c = 1; c <= nCols; c++) {
                
                tables.push({
                    tableNumber: `${zoneName}${counter}`, // เริ่ม A1, A2 แน่นอน
                    zone: zoneName,
                    row: r,
                    column: c,
                    price: (price !== undefined && price !== null && price !== '') ? Number(price) : 5000,
                    status: 'available'
                });
                
                counter++;
            }
        }

        // บันทึกทีเดียว
        await Table.insertMany(tables);

        res.status(201).json({ 
            status: 'success', 
            message: `สร้างโซน ${zoneName} ใหม่สำเร็จ จำนวน ${tables.length} โต๊ะ`, 
            data: tables
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 9. แก้ไขโต๊ะ
const updateTable = async (req, res) => {
    try {
        const updatedTable = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 10. ลบโต๊ะ
const deleteTable = async (req, res) => {
    try {
        await Table.findByIdAndDelete(req.params.id);
        res.json({ message: 'ลบโต๊ะเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSlip = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { slipImage } = req.body; // รับ URL รูปภาพมา

        if (!slipImage) return res.status(400).json({ message: 'ไม่พบข้อมูลรูปภาพ' });

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { slipImage: slipImage }, // บันทึก URL ลง DB
            { new: true }
        );

        if (!booking) return res.status(404).json({ message: 'ไม่พบรายการจอง' });

        res.json({ message: 'บันทึกหลักฐานการโอนเงินเรียบร้อย', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔥 11. ลบโซน (Delete Zone) - ลบเกลี้ยงทั้งโซน
const deleteZone = async (req, res) => {
    try {
        const { zoneName } = req.params;
        if (!zoneName) return res.status(400).json({ message: 'ระบุชื่อโซน' });

        // ลบจริง
        const result = await Table.deleteMany({ zone: zoneName });

        res.json({ 
            message: `ลบโซน ${zoneName} และโต๊ะจำนวน ${result.deletedCount} รายการเรียบร้อย`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔥 12. ลบหลายโต๊ะ (Bulk Delete)
const bulkDeleteTables = async (req, res) => {
    try {
        const { ids } = req.body; // รับ [id1, id2, id3]
        if (!ids || ids.length === 0) return res.status(400).json({ message: 'ไม่พบรายการที่เลือก' });

        await Table.deleteMany({ _id: { $in: ids } });

        res.json({ message: `ลบโต๊ะ ${ids.length} รายการเรียบร้อย` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔥 13. [NEW] เพิ่มโต๊ะรายตัว (แบบระบุพิกัด Row/Col) ✅ เก็บตัวนี้ไว้ตัวเดียวพอครับ
const addSingleTable = async (req, res) => {
    try {
        const { zone, row, column, price } = req.body;
        
        if (!zone || !row || !column) {
            return res.status(400).json({ message: 'กรุณาระบุโซน แถว และคอลัมน์' });
        }

        // สร้างชื่อโต๊ะตาม Format (เช่น B : 1-4)
        const tableNumber = `${zone} : ${row}-${column}`;

        // เช็คซ้ำ
        const exists = await Table.findOne({ tableNumber });
        if (exists) {
            return res.status(400).json({ message: `โต๊ะ ${tableNumber} มีอยู่แล้ว` });
        }

        const newTable = new Table({
            tableNumber,
            zone,
            row: parseInt(row),
            column: parseInt(column),
            price: parseInt(price) || 1500,
            status: 'available'
        });

        await newTable.save();

        res.json({ message: `เพิ่มโต๊ะ ${tableNumber} เรียบร้อย`, data: newTable });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTables,
    getTableById,
    getMyBookings,
    reserveTable,
    moveTable,      // มีฟังก์ชันรองรับแล้ว
    approvePayment, // มีฟังก์ชันรองรับแล้ว
    cancelReservation,
    addZone,
    updateTable,
    deleteTable,
    getAllBookings,
    updateSlip,
    deleteZone,
    bulkDeleteTables,
    addSingleTable,
    
};