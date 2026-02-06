const express = require('express');
const router = express.Router();

// เราจะสร้าง Controller ทีหลัง
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;