// controllers/settingController.js
const SiteSetting = require('../models/SettingModel');

// @desc    ดึงข้อมูลการตั้งค่า (ถ้าไม่มีให้สร้างใหม่)
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
        settings = await SiteSetting.create({}); 
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    บันทึกการตั้งค่า
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const settings = await SiteSetting.findOneAndUpdate({}, req.body, { 
      new: true, 
      upsert: true, // ถ้าไม่มีให้สร้างใหม่
      setDefaultsOnInsert: true
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    จัดการหลังจากอัปโหลดรูปเสร็จ (คืนค่าชื่อไฟล์)
// @route   POST /api/settings/upload
// @access  Private/Admin
exports.uploadFileHandler = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // ส่งชื่อไฟล์กลับไปให้ Frontend
    res.json({ filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};