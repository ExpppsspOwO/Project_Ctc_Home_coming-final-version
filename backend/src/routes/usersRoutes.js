const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController'); // เรียกใช้ Controller เดียวกัน
const usersController = require('../controllers/usersController');
const upload = require('../middleware/uploadMiddleware');

// ดูโปรไฟล์ตัวเอง
router.get('/profile', protect, usersController.getUserProfile);
// ✅ แก้ไขโปรไฟล์ (ใช้ Controller)
router.put('/profile', protect, usersController.updateUserProfile);

// ✅ อัปโหลดรูปโปรไฟล์ (ใช้ Middleware 'avatar' + Controller)
router.post('/upload-avatar', protect, upload.single('avatar'), usersController.uploadAvatar);


// --- Admin Zone ---
// 1. ดึงรายชื่อทั้งหมด
router.get('/', protect, checkRole('admin'), authController.getAllUsers);

// 2. เพิ่ม User
router.post('/', protect, checkRole('admin'), authController.createUser);

// 3. แก้ไข User
router.put('/:id', protect, checkRole('admin'), authController.updateUser);

// 4. ลบ User
router.delete('/:id', protect, checkRole('admin'), authController.deleteUser);

module.exports = router;