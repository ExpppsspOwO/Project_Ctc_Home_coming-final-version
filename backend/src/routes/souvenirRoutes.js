const express = require('express');
const router = express.Router();
const souvenirController = require('../controllers/souvenirController');
const upload = require('../middleware/uploadMiddleware'); // ตัวจัดการรูป
const { protect, checkRole } = require('../middleware/authMiddleware'); // ตัวจัดการสิทธิ์

// GET: ใครๆ ก็ดูสินค้าได้
router.get('/', souvenirController.getAllSouvenirs);

router.get('/admin/all', protect, checkRole('admin', 'officer'), souvenirController.getAdminSouvenirs);

// POST: แอดมินเพิ่มสินค้า (พร้อมรูป)
router.post('/', 
    protect, 
    checkRole('admin', 'officer'), 
    upload.single('image'), // ✅ ใน Frontend ต้องตั้งชื่อ field ว่า 'image' นะ
    souvenirController.createSouvenir
);

// PUT: แอดมินแก้ไขสินค้า
router.put('/:id', 
    protect, 
    checkRole('admin', 'officer'), 
    upload.single('image'), 
    souvenirController.updateSouvenir
);

// DELETE: แอดมินลบสินค้า
router.delete('/:id', 
    protect, 
    checkRole('admin', 'officer'), 
    souvenirController.deleteSouvenir
);



module.exports = router;