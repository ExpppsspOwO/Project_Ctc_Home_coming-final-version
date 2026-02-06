const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app'); // นำเข้า app ที่ config route ไว้แล้ว
const User = require('./models/userModels'); 

// 1. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 2. ฟังก์ชัน Seed Admin (แบบ Plain Text - ไม่เข้ารหัส)
const seedAdminUser = async () => {
    const MAX_RETRIES = 5; // ลองได้สูงสุด 5 ครั้ง
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            const adminEmail = 'admin@ccollege.ac.th';
            const adminPassword = 'adminharu_urara123'; // รหัสผ่านที่ต้องการ
            
            // เช็คก่อนว่ามี user นี้หรือยัง?
            const existingUser = await User.findOne({ email: adminEmail });
            
            if (existingUser) {
                console.log('ℹ️  Admin user already exists.');
                return; // จบการทำงาน
            }

            console.log('⚡ Creating default Admin user...');
            
            // ❌ ลบส่วน Hash Password ทิ้งไป
            // const salt = await bcrypt.genSalt(10);
            // const hashedPassword = await bcrypt.hash('adminharu_urara123', salt);

            const newAdmin = new User({
                name: 'Admin_urara',
                username: 'admin_urara',
                phone:'0xxxxxxxxxx',
                email: adminEmail,
                password: adminPassword, // ✅ ใส่รหัสผ่านแบบ Plain Text ตรงๆ
                role: 'admin'
            });

            await newAdmin.save();
            console.log('✅ Admin user created successfully!');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Pass:  ${adminPassword}`);
            return; // สำเร็จแล้ว ออกจากลูป

        } catch (error) {
            // เช็ค Error ถ้าเป็นเรื่อง Not Primary ให้รอแล้วลองใหม่
            if (error.message.includes('not in primary') || error.message.includes('not master')) {
                attempt++;
                console.log(`⏳ Database is not ready for writes. Retrying... (${attempt}/${MAX_RETRIES})`);
                
                // รอ 2 วินาที ก่อนลองใหม่ (Delay)
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                // ถ้าเป็น Error อื่น (เช่น โค้ดผิด) ให้แจ้งเตือนและหยุดเลย
                console.error('❌ Failed to seed admin user:', error.message);
                return;
            }
        }
    }
    console.error('❌ Give up seeding admin user after multiple retries.');
};

// 3. Connect DB แล้วค่อย Start Server (ทำทีเดียว จบ)
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        
        // สร้าง Admin (ถ้ายังไม่มี)
        seedAdminUser(); 
        
        // เริ่มรัน Server หลังจากต่อ DB ติดแล้วเท่านั้น
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.log('❌ MongoDB Connection Error:', err));

module.exports = app;