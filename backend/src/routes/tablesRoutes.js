const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Public: ดูโต๊ะ
router.get('/', tableController.getTables);
router.get('/:id', tableController.getTableById);

// Admin: สร้าง/แก้ไข/ลบ
router.post('/add-zone', protect, checkRole('admin','officer'), tableController.addZone);
router.put('/:id', protect, checkRole('admin','officer'), tableController.updateTable);
router.delete('/:id', protect, checkRole('admin','officer'), tableController.deleteTable);

// ✅ ฟังก์ชันใหม่สำหรับเพิ่มโต๊ะรายตัว (Row-Col)
router.post('/add-table', protect, checkRole('admin','officer'), tableController.addSingleTable);

// ✅ เหลือแค่ฟังก์ชันที่ใช้งานจริง (ลบ batch-create ทิ้งเพราะใน Controller ไม่มีแล้ว)
router.post('/bulk-delete', protect, checkRole('admin','officer'), tableController.bulkDeleteTables); // ลบหลายตัว
router.delete('/zone/:zoneName', protect, checkRole('admin','officer'), tableController.deleteZone); // ลบยกโซน

module.exports = router;