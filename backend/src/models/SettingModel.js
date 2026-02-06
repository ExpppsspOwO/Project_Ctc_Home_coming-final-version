// models/SettingModel.js
const mongoose = require('mongoose');

const SiteSettingSchema = new mongoose.Schema({
  // ... (ส่วนอื่นๆ เหมือนเดิม) ...
  system: {
    booking: { type: Boolean, default: true },
    purchasing: { type: Boolean, default: true },
    autoCancelMinutes: { type: Number, default: 60 }
  },
  branding: {
    siteName: { type: String, default: 'CTC Homecoming 2025' },
    showSiteName: { type: Boolean, default: true },
    logo: { type: String, default: null },
    showLogo: { type: Boolean, default: true }
  },
  hero: {
    line1: { text: { type: String, default: 'Welcome Back' }, color: { type: String, default: '#000000' }, show: { type: Boolean, default: true } },
    line2: { text: { type: String, default: 'CTC Homecoming' }, color: { type: String, default: '#3B82F6' }, show: { type: Boolean, default: true }, aurora: { type: Boolean, default: true } },
    line3: { text: { type: String, default: '2025' }, color: { type: String, default: '#000000' }, show: { type: Boolean, default: true } },
    subText: { text: { type: String, default: 'งานคืนสู่เหย้าที่เรารอคอย กลับมาเจอกันที่เก่า เวลาเดิม' }, show: { type: Boolean, default: true } }
  },
  // ✅ แก้ไข Stats ให้เก็บ color ด้วย
  stats: { 
      show: { type: Boolean, default: true }, 
      items: [{
          id: Number,
          icon: String,
          val: String,
          label: String,
          color: { type: String, default: '#FFFFFF' } // เพิ่มสี
      }]
  },
  agenda: { show: { type: Boolean, default: true }, items: { type: Array, default: [] } },
  gallery: { show: { type: Boolean, default: true }, items: { type: Array, default: [] } },
  faq: { show: { type: Boolean, default: true }, items: { type: Array, default: [] } },
  line: { show: { type: Boolean, default: true }, id: { type: String, default: '@ctc_homecoming' }, qrCode: { type: String, default: null } },
  payment: { show: { type: Boolean, default: true }, bank: { type: String, default: '' }, accountName: { type: String, default: '' }, accountNumber: { type: String, default: '' } },
  footer: {
    show: { type: Boolean, default: true },
    text: { show: { type: Boolean, default: true }, content: { type: String, default: '' } },
    social: {
        facebook: { url: String, show: { type: Boolean, default: true } },
        instagram: { url: String, show: { type: Boolean, default: true } },
        twitter: { url: String, show: { type: Boolean, default: true } },
        website: { url: String, show: { type: Boolean, default: true } }
    },
    contact: {
        address: { text: String, show: { type: Boolean, default: true } },
        phone: { text: String, show: { type: Boolean, default: true } },
        email: { text: String, show: { type: Boolean, default: true } }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);