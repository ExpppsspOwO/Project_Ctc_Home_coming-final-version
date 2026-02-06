const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ---------------- USER ROUTES / ADMIN ROUTES ----------------

// User/Admin: ยกเลิก
router.put('/cancel/:bookingId', protect, bookingController.cancelReservation);

// ---------------- USER ROUTES ----------------

// User: ดูของตัวเอง
router.get('/my', protect, bookingController.getMyBookings);

// User: จอง
router.post('/', protect, bookingController.reserveTable);


// User: อัปสลิป (ต้องใส่ upload.single('slip') คั่นตรงกลาง!)
router.put('/slip/:bookingId', 
    protect, 
    upload.single('slip'), // 👈 เพิ่มตรงนี้! ไม่งั้น Controller ไม่ได้รับรูป
    bookingController.updateSlip
);

// ---------------- ADMIN ROUTES ----------------
// Admin: ดูทั้งหมด
router.get('/all', protect, checkRole('admin','officer'), bookingController.getAllBookings);

// Admin: อนุมัติ
router.put('/approve/:bookingId', protect, checkRole('admin','officer'), bookingController.approvePayment);

// Admin: แก้ไข/ย้ายโต็ะ
router.put('/update/:id', protect, checkRole('admin','officer'), bookingController.updateBooking);

// 🔥 Route ล้างประวัติ (Admin เท่านั้น)
router.delete('/bulk-delete', protect, checkRole('admin'),bookingController.bulkDeleteBookings);



module.exports = router;