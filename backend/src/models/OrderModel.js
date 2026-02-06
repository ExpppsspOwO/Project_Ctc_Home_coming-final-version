const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    // 1. ใครซื้อ?
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // 2. ซื้ออะไร?
    items: [{
        _id: false, // ปิด auto id ของ item ย่อย
        
        souvenir: { 
            type: Schema.Types.ObjectId, 
            ref: 'Souvenir', 
            required: true 
        },
        
        // Snapshot รหัสสินค้า (ถ้าไม่มีจะใช้ _id แทน)
        code: { type: String, default: 'N/A' }, 
        
        // Snapshot ชื่อและราคา ณ ตอนนั้น (สำคัญมาก!)
        name: String,      
        price: Number,     
        image: String, // เก็บรูปไว้โชว์ในประวัติด้วย
        
        quantity: { type: Number, required: true, min: 1 }
    }],

    // 3. ยอดรวม (คำนวณจาก Backend เท่านั้น)
    totalPrice: { type: Number, required: true },

    // 4. หลักฐานการโอน
    slipImage: { type: String, default: null },
    
    // 5. วันที่ชำระเงิน
    paymentDate: { type: Date, default: null },

    // 6. วันหมดอายุ , required: true, index: true 
    expiresAt: { type: Date}, 

    // 7. สถานะ
    status: {
        type: String,
        enum: ['pending', 'waiting_verify', 'paid', 'completed', 'cancelled','payment_failed'],
        default: 'pending'
    },
    paymentRef: { type: String, default: '' },
    remark: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);