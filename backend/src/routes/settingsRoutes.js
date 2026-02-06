const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/authMiddleware');
const settingController = require('../controllers/settingController');

// ✅ เรียกใช้ Middleware ตัวกลาง (ที่เราเพิ่งอัปเกรด)
const upload = require('../middleware/uploadMiddleware'); 



router.get('/', settingController.getSettings);

router.use(protect, checkRole('admin'));
router.put('/', settingController.updateSettings);

// ✅ ใช้ upload.any() เพื่อรับไฟล์ได้ทุกชื่อ field (logo, qrCode, image)
// Middleware จะเป็นตัวคัดแยกโฟลเดอร์เอง
router.post('/upload', upload.any(), (req, res, next) => {
    if (req.files && req.files.length > 0) {
        // Log ดูว่าไฟล์ไปลงที่ไหน
        // console.log(`✅ Uploaded [${req.files[0].fieldname}] to: ${req.files[0].path}`);
        
        // Hack: ส่ง req.file ให้ Controller (เพราะ Controller เดิมใช้ req.file)
        req.file = req.files[0]; 
    }
    next();
}, settingController.uploadFileHandler);

module.exports = router;