// backend/controllers/authController.js
const User = require('../models/userModels'); // อย่าลืม import Model
const jwt = require('jsonwebtoken');

// ✅ 1. ดูโปรไฟล์ (Get Profile)
exports.getUserProfile = async (req, res) => {
    try {
        // ดึงข้อมูล User จาก ID (ตัด password ออกเพื่อความปลอดภัย)
        const user = await User.findById(req.user.id).select('-password');
        
        if (user) {
            res.json({
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar || '', // ส่ง avatar ไปด้วย
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ 2. อัปเดตโปรไฟล์ (Update Profile)
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // อัปเดตข้อมูลเฉพาะที่ส่งมา
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.avatar = req.body.avatar || user.avatar; // รับชื่อไฟล์ หรือ URL

            // ถ้ามีการส่งรหัสผ่านใหม่มา ให้เปลี่ยนด้วย
            if (req.body.password) {
                user.password = req.body.password; 
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ 3. อัปโหลดรูป (Upload Avatar)
exports.uploadAvatar = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'กรุณาเลือกไฟล์รูปภาพ' });
    }
    // ส่งชื่อไฟล์กลับไปให้ Frontend
    res.json({ 
        message: 'Upload successful',
        filename: req.file.filename 
    });
};
