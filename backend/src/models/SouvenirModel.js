const mongoose = require('mongoose');

const souvenirSchema = new mongoose.Schema({
  code: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        uppercase: true // เช่น p001 -> P001
    },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  // ตัด stock และ category ออกตาม Requirement
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Souvenir', souvenirSchema);