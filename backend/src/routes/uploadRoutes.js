const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// 1. อัปโหลดสลิป (User)
router.post('/slip', protect, uploadController.upload.single('slip'), uploadController.uploadFile);
// (แถมอันนี้ให้ เผื่อโค้ดเก่าคุณยิงมาที่ / เฉยๆ)
router.post('/', protect, uploadController.upload.single('slip'), uploadController.uploadFile);

// 2. ✅ เพิ่ม: อัปโหลดรูปสินค้า (Admin) -> รับ field ชื่อ 'souvenir'
router.post('/souvenir', protect, uploadController.upload.single('souvenir'), uploadController.uploadFile);

module.exports = router;