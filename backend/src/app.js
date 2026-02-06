const express = require('express');
const cors = require('cors');
const path = require('path');
const startCronJob = require('./utils/cronJob');

// 1. สร้าง App
const app = express();

// 2. Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 3. Import Routes
const authRoutes = require('./routes/authRoutes');
const tableRoutes = require('./routes/tablesRoutes'); 
const uploadRoutes = require('./routes/uploadRoutes');
const souvenirRoutes = require('./routes/souvenirRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const orderRoutes = require('./routes/ordersRoutes')
const usersRoutes = require('./routes/usersRoutes')
const settingRoutes = require('./routes/settingsRoutes')

// ==========================================
// 🛠️ แก้ไขปัญหา Cannot GET รูปภาพ (สำคัญ!)
// ==========================================

// ใช้ process.cwd() เพื่อให้มั่นใจว่าชี้ไปที่โฟลเดอร์ uploads ที่ Root ของโปรเจกต์เสมอ
const uploadsPath = path.join(process.cwd(), 'uploads');

// 1. เปิดให้เข้าถึงโฟลเดอร์ uploads ทั้งหมด
app.use('/uploads', express.static(uploadsPath));

// 2. (Optional) ระบุเจาะจงโฟลเดอร์ย่อย (รูปทั้งหมด)
app.use('/uploads/slip_souvenirs', express.static(path.join(uploadsPath, 'slip_souvenirs')));
app.use('/uploads/slip_tables', express.static(path.join(uploadsPath, 'slip_tables')));
app.use('/uploads/souvenir_Img', express.static(path.join(uploadsPath, 'souvenir_Img')));

// 3. (Optional) ระบุเจาะจงโฟลเดอร์ย่อย (รูปในการตั้งค่า)
app.use('/uploads/avatars', express.static(path.join(uploadsPath, 'avatars')));
app.use('/uploads/site/logo', express.static(path.join(uploadsPath, 'site/logo')));
app.use('/uploads/site/qr_code', express.static(path.join(uploadsPath, 'site/qr_code')));
app.use('/uploads/site/photos', express.static(path.join(uploadsPath, 'site/photos')));
// console.log('Serving static files from:', uploadsPath); // ดู Log นี้ตอนรันว่า Path ถูกไหม

// ==========================================

// 4. เชื่อมต่อ Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/souvenirs', souvenirRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/orders', orderRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/settings', settingRoutes)


startCronJob();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Test Route
app.get('/', (req, res) => {
    res.send('<h1>MERN Backend Running...</h1>')
});

module.exports = app;