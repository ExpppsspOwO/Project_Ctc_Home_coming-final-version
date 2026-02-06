const cron = require('node-cron');
const Booking = require('../models/BookingModel');
const Table = require('../models/TableModels');
const Order = require('../models/OrderModel'); // ✅ อย่าลืม Import

const startAutoCancelJob = () => {
    // รันทุกๆ 1 นาที (* * * * *)
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // console.log(`⏰ Running Auto-Cancel Check...`); // (เปิดคอมเมนต์ถ้าอยากเห็น Log รัวๆ)

            // ==========================================
            // 1. ส่วนจัดการ Booking (จองโต๊ะ)
            // ==========================================
           const expiredBookings = await Booking.find({
                status: { $in: ['pending', 'payment_failed'] }, 
                expiresAt: { $lt: now } 
            });

            if (expiredBookings.length > 0) {
                console.log(`🔥 พบ Booking หมดอายุ ${expiredBookings.length} รายการ`);

                for (const booking of expiredBookings) {
                    // 1.1 เปลี่ยนสถานะเป็น cancelled
                    const oldStatus = booking.status;
                    booking.status = 'cancelled';
                    booking.remark = `ระบบยกเลิกอัตโนมัติ (หมดเวลาชำระเงิน) - สถานะเดิม: ${oldStatus}`;
                    await booking.save();

                    // 1.2 รวบรวม ID โต๊ะที่จะคืน (รองรับทั้งโครงสร้างใหม่และเก่า)
                    let tableIdsToFree = [];

                    if (booking.tables && booking.tables.length > 0) {
                        tableIdsToFree = booking.tables.map(t => t.tableId);
                    }

                    // กรณีโครงสร้างเก่า (Single Reference) - กันเหนียวไว้
                    else if (booking.table) {
                        tableIdsToFree.push(booking.table);
                    }

                    // 1.3 สั่งปลดล็อคโต๊ะ (คืนสถานะ available)
                    if (tableIdsToFree.length > 0) {
                        const updateResult = await Table.updateMany(
                            { _id: { $in: tableIdsToFree } },
                            { $set: { status: 'available' } }
                        );
                        console.log(`   └─ 🔓 คืนโต๊ะ ${updateResult.modifiedCount} ตัว (${tableIdsToFree.join(', ')})`);
                    }
                    console.log(`   ✅ ยกเลิก Booking ID: ${booking.bookingRef || booking._id} สำเร็จ`);
                }
            }

            // ==========================================
            // 2. ส่วนจัดการ Order (สั่งของ) - ทำงานต่อเลย ไม่ต้องรอ Booking
            // ==========================================
            const expiredOrders = await Order.find({
                status: { $in: ['pending', 'payment_failed'] },
                expiresAt: { $lt: now }
            });

            if (expiredOrders.length > 0) {
                console.log(`📦 พบ Order หมดอายุ ${expiredOrders.length} รายการ`);
                
                for (const order of expiredOrders) {
                    // 2.1 เปลี่ยนสถานะ
                    const oldStatus = order.status;
                    order.status = 'cancelled';
                    order.remark = `ระบบยกเลิกอัตโนมัติ (หมดเวลาชำระเงิน) - สถานะเดิม: ${oldStatus}`;
                    await order.save();
                    
                    // (Optional) ถ้ามี Stock สินค้า เขียนคืน Stock ตรงนี้
                   console.log(`   ❌ ยกเลิก Order ID: ${order._id} (${oldStatus})`);
                }
            }

        } catch (error) {
            console.error('❌ Cron Job Error:', error);
        }
    });
};

module.exports = startAutoCancelJob;