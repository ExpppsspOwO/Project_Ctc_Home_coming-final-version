// backend/models/userModels.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid']
    },
    phone: {
        type: String,
        required: [true, 'phone is required']
    },
    
    // ✅ เพิ่มส่วนนี้ครับ! (สำคัญมาก ไม่งั้นรูปไม่บันทึก)
    avatar: {
        type: String,
        default: null
    },

    // ✅ แก้จุดนี้: เก็บ role เดียว เป็น String ง่ายๆ
    role: {
        type: String,
        enum: ['user', 'officer', 'admin'],
        default: 'user'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('User', userSchema, 'users');