const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    // ✅ เพิ่มตรงนี้: เลขที่ใบจอง (เอาไว้ให้ลูกค้าแจ้งโอน)
    bookingRef: { type: String, unique: true },

    // 1. ใครจอง?
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // 2. จองโต๊ะไหนบ้าง? (✅ แก้จาก table ตัวเดียว เป็น tables แบบ Array)
    tables: [
        {
            _id:false,
            tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
            code: String,
            tableNumber: String, // เก็บเลขโต๊ะไว้ด้วย
            price: Number        // เก็บราคา ณ ตอนจอง
        }
    ],

    // 3. ยอดรวม (✅ เพิ่ม field นี้เพราะจองหลายโต๊ะต้องมีราคารวม)
    totalPrice: { type: Number, required: true },

    // 4. ข้อมูลการจ่ายเงิน
    slipImage: { type: String, default: null },
    paymentDate: { type: Date },
    expiresAt: { type: Date, required: true, index: true },
    // 5. สถานะ
    status: {
        type: String,
        enum: ['pending', 'waiting_verify', 'verified', 'cancelled','payment_failed'],
        default: 'pending'
    },
    
    remark: { type: String, default: '' },
    paymentRef: { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);