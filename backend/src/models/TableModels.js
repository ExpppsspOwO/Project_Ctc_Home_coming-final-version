const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    row: { type: Number, required: true },
    column: { type: Number, required: true },
    price: { type: Number, required: true },
    
    // เหลือไว้แค่สถานะ ว่าง/ไม่ว่าง (เพื่อความเร็วในการแสดงผล)
    status: { 
        type: String, 
        enum: ['available', 'booked', 'paid'],
        default: 'available' 
    }
}, { timestamps: true });


module.exports = mongoose.model('Table', tableSchema);