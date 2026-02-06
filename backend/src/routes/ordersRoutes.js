const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, checkRole }  = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware');

// ---------------- USER ROUTES ----------------
router.post('/', protect, orderController.createOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.post('/:id/pay', protect, upload.single('slip'), orderController.uploadSlip);

// ยกเลิกสินค้า (User ใช้ได้, Admin ใช้ได้เพราะเราแก้ Controller แล้ว)
router.put('/:id/cancel', protect, orderController.cancelOrder);

// ---------------- ADMIN ROUTES ----------------
// ดู Order ทั้งหมด
router.get('/admin/all', 
    protect, 
    checkRole('admin', 'officer'), 
    orderController.getAllOrders
);

// เปลี่ยนสถานะ Order
router.put('/admin/:id/status', 
    protect, 
    checkRole('admin', 'officer'), 
    orderController.updateOrderStatus
);

// ✅ เพิ่มใหม่: ลบหลายรายการ (Bulk Delete)
// ** วางไว้ก่อน /:id นะครับ เพื่อกัน Route ชนกัน (ถึงอันนี้จะเป็น DELETE แต่กันไว้ก่อนดีกว่า)
router.delete('/bulk-delete', 
    protect, 
    checkRole('admin', 'officer'), 
    orderController.bulkDeleteOrders
);

module.exports = router;