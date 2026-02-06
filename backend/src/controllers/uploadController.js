// controllers/uploadController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. ฟังก์ชันช่วยสร้างโฟลเดอร์ (ถ้ายังไม่มี)
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
}

// ✅ สร้าง 3 โฟลเดอร์รอไว้เลย
ensureDir('uploads/souvenir_Img');  // รูปสินค้า
ensureDir('uploads/slip_souvenirs'); // สลิปซื้อของ
ensureDir('uploads/slip_tables');    // สลิปจองโต๊ะ

// 2. ตั้งค่าการจัดเก็บไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // กรณีอัปโหลดรูปสินค้า (Admin เพิ่มสินค้า)
        if (file.fieldname === 'souvenir') {
            cb(null, 'uploads/souvenir_Img/');
        } 
        // กรณีอัปโหลดสลิป (User แจ้งโอน)
        else if (file.fieldname === 'slip') {
            // 🔍 เช็คจาก URL ว่ามาจาก route ไหน?
            if (req.originalUrl.includes('/orders')) {
                cb(null, 'uploads/slip_souvenirs/');
            } else if (req.originalUrl.includes('/bookings')) {
                cb(null, 'uploads/slip_tables/');
            } else {
                // เผื่อเหลือเผื่อขาด (ไม่ควรเข้าเคสนี้)
                cb(null, 'uploads/slip_souvenirs/');
            }
        } else {
            cb(null, 'uploads/'); // Default
        }
    },
    filename: (req, file, cb) => {
        // ✅ ถ้าเป็นสลิป ให้ตั้งชื่อไฟล์ตาม Order ID / Booking ID ไปเลย
        // (ID จะส่งมาทาง params: /api/orders/:id/pay)
        if (file.fieldname === 'slip' && req.params.id) {
            const ext = path.extname(file.originalname);
            cb(null, `${req.params.id}${ext}`); // ผลลัพธ์: 659abc12345.jpg
        } else {
            // ถ้าเป็นรูปสินค้า หรืออื่นๆ ให้สุ่มชื่อเหมือนเดิม กันไฟล์ซ้ำ
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// 3. ฟังก์ชันอัปโหลด (Response กลับไปหา Client)
const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'กรุณาเลือกไฟล์รูปภาพ' });
    }
    
    const protocol = req.protocol;
    const host = req.get('host');
    
    // 🛠️ สร้าง URL ให้ตรงกับโฟลเดอร์ที่เก็บจริง เพื่อส่งกลับไปให้ Frontend แสดงผล
    let folder = 'uploads';
    
    if (req.file.fieldname === 'souvenir') {
        folder = 'uploads/souvenir_Img';
    } else if (req.file.fieldname === 'slip') {
        if (req.originalUrl.includes('/orders')) {
            folder = 'uploads/slip_souvenirs';
        } else if (req.originalUrl.includes('/bookings')) {
            folder = 'uploads/slip_tables';
        }
    }

    // ผลลัพธ์: http://localhost:5000/uploads/slip_souvenirs/659abc12345.jpg
    const fileUrl = `${protocol}://${host}/${folder}/${req.file.filename}`;

    res.json({ message: 'อัปโหลดสำเร็จ!', url: fileUrl, filename: req.file.filename });
};

module.exports = { upload, uploadFile };