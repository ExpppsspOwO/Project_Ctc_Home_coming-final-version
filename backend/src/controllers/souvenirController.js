const Souvenir = require('../models/SouvenirModel');
const fs = require('fs');
const path = require('path');

// 1. ดึงสินค้าทั้งหมด (User)
exports.getAllSouvenirs = async (req, res) => {
    try {
        // ✅ เพิ่มเงื่อนไข { isAvailable: true }
        const souvenirs = await Souvenir.find({ isAvailable: true }).sort({ createdAt: -1 });
        res.json(souvenirs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Admin ใช้
exports.getAdminSouvenirs = async (req, res) => {
    try {
        // ไม่ต้องกรอง isAvailable เอามาหมดเลย
        const souvenirs = await Souvenir.find().sort({ createdAt: -1 });
        res.json(souvenirs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. เพิ่มสินค้าใหม่ (Admin Only) + รูปภาพ
exports.createSouvenir = async (req, res) => {
    try {
        const { name, price, description, code, isAvailable } = req.body;
        // รับชื่อไฟล์จาก Multer (ถ้ามี)
        const image = req.file ? req.file.filename : ''; 

        const finalCode = code && code.trim() !== '' 
            ? code 
            : `SOV-${Date.now()}`;

        const newSouvenir = new Souvenir({
            name,
            price,
            description,
            code: finalCode,
            image, // เก็บแค่ชื่อไฟล์ เช่น "souvenir-1234.jpg"
            isAvailable: isAvailable === 'true' || isAvailable === true
        });

        await newSouvenir.save();
        res.status(201).json(newSouvenir);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. ลบสินค้า (Admin Only)
exports.deleteSouvenir = async (req, res) => {
    try {
        const souvenir = await Souvenir.findById(req.params.id);
        if (!souvenir) return res.status(404).json({ message: 'ไม่พบสินค้า' });

        // ลบไฟล์รูปทิ้งด้วยเพื่อไม่ให้รก Server
        if (souvenir.image) {
            const imagePath = path.join('uploads', 'souvenir_Img', souvenir.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Souvenir.findByIdAndDelete(req.params.id);
        res.json({ message: 'ลบสินค้าสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. แก้ไขสินค้า (Admin Only)
exports.updateSouvenir = async (req, res) => {
    try {
        const { name, price, description, code, isAvailable } = req.body;
        let updateData = { name, price, description, code, isAvailable };

        // ถ้ามีการอัปโหลดรูปใหม่
        if (req.file) {
            const souvenir = await Souvenir.findById(req.params.id);
            // ลบรูปเก่าทิ้งก่อน
            if (souvenir && souvenir.image) {
                const oldImagePath = path.join('uploads', 'souvenir_Img', souvenir.image);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            updateData.image = req.file.filename; // ใส่รูปใหม่
        }

        const updatedSouvenir = await Souvenir.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        res.json(updatedSouvenir);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};