const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. ✅ สร้างโฟลเดอร์รอไว้ให้ครบ (เพิ่ม logo และ qr_code)
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir('uploads/souvenir_Img');
ensureDir('uploads/slip_souvenirs');
ensureDir('uploads/slip_tables');
ensureDir('uploads/site/photos');
ensureDir('uploads/site/logo');    // <--- เพิ่ม
ensureDir('uploads/site/qr_code'); // <--- เพิ่ม
ensureDir('uploads/avatars');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'avatar') {
            cb(null, 'uploads/avatars/');
        }
        if (file.fieldname === 'logo') {
            cb(null, 'uploads/site/logo/');
        } 
        else if (file.fieldname === 'qrCode') {
            cb(null, 'uploads/site/qr_code/');
        } 
        // ถ้าเป็น field 'image' และมาจากหน้า settings ให้ลง photos (สำหรับ Gallery)
        else if (req.originalUrl.includes('/settings') && file.fieldname === 'image') {
            cb(null, 'uploads/site/photos/');
        }
        // ... Logic เดิมสำหรับส่วนอื่น ...
        else if (file.fieldname === 'image' || file.fieldname === 'souvenir') {
            cb(null, 'uploads/souvenir_Img/');
        } 
        else if (file.fieldname === 'slip') {
            if (req.originalUrl.includes('/orders')) {
                cb(null, 'uploads/slip_souvenirs/');
            } else if (req.originalUrl.includes('/bookings')) {
                cb(null, 'uploads/slip_tables/');
            } else {
                cb(null, 'uploads/slip_souvenirs/');
            }
        } 
        else {
            cb(null, 'uploads/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น!'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

module.exports = upload;