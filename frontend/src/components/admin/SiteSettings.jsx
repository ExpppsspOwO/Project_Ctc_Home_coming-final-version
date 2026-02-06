// src/components/admin/SiteSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Save, UploadCloud, Plus, Trash2, Image as ImageIcon,
  ToggleLeft, Palette, Layout, Clock,
  HelpCircle, MessageCircle, Share2, MapPin, X,
  Loader2, CreditCard, Facebook, Instagram, Twitter, Globe,
  Phone, Mail, ExternalLink,
  Users, Utensils, Music, Heart, Star, Camera
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../config';

// Map Icon สำหรับแสดงผลในตัวเลือก
const iconOptions = [
  { id: 'Users', Icon: Users },
  { id: 'Utensils', Icon: Utensils },
  { id: 'Music', Icon: Music },
  { id: 'Heart', Icon: Heart },
  { id: 'Star', Icon: Star },
  { id: 'Clock', Icon: Clock },
  { id: 'Camera', Icon: Camera },
  { id: 'MapPin', Icon: MapPin },
];

// --- Components ---
const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)} className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`}>
    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-7' : 'translate-x-0'}`} />
  </button>
);

const MiniToggle = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChange(!checked)}>
    <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`}>
      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
    {label && <span className="text-xs text-gray-500 dark:text-slate-400 font-bold select-none">{label}</span>}
  </div>
);

const ColorPicker = ({ selected, onChange, disabled }) => {
  const presets = [
    { color: '#FFFFFF', border: true },
    { color: '#FEF08A' },
    { color: '#BFDBFE' },
    { color: '#BBF7D0' },
    { color: '#FBCFE8' },
  ];
  return (
    <div className={`flex items-center gap-2 mt-2 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      {presets.map((p) => (
        <button key={p.color} type="button" onClick={() => onChange(p.color)} className={`w-6 h-6 rounded-full shadow-sm transition-transform hover:scale-110 ${selected === p.color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''} ${p.border ? 'border border-gray-300 dark:border-slate-500' : 'border-transparent'}`} style={{ backgroundColor: p.color }} />
      ))}
      <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-gray-200 dark:border-slate-600 shadow-sm cursor-pointer hover:scale-110 transition">
        <input type="color" value={selected} onChange={(e) => onChange(e.target.value)} className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 border-0 cursor-pointer" />
      </div>
    </div>
  );
};

const ImageUpload = ({ preview, onFileChange, label }) => {
  const getFullImageUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('blob:') || src.startsWith('http')) return src;
    const serverUrl = API_BASE_URL.replace('/api', '');
    return `${serverUrl}/uploads/site/photos/${src}`;
  };
  return (
    <label className="block w-full aspect-video bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition relative overflow-hidden group">
      {preview ? (
        <img src={getFullImageUrl(preview)} alt="Preview" className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://placehold.co/400x300?text=No+Image"; }} />
      ) : (
        <div className="text-center text-gray-400 dark:text-slate-500"><ImageIcon size={24} className="mx-auto mb-1" /><span className="text-[10px]">{label}</span></div>
      )}
      <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><div className="text-white flex flex-col items-center"><UploadCloud size={24} /><span className="text-xs mt-1">คลิกเพื่ออัปโหลด</span></div></div>
    </label>
  );
};

const SectionCard = ({ icon: Icon, title, isOn, onToggle, children, action, noToggle }) => (
  <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOn || noToggle ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'}`}>
          {Icon && <Icon size={20} />}
        </div>
        <h3 className={`text-lg font-bold ${isOn || noToggle ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>{title}</h3>
      </div>
      <div className="flex items-center gap-4">
        {action}
        {!noToggle && <div className="h-6 w-[1px] bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>}
        {!noToggle && <Toggle checked={isOn} onChange={onToggle} />}
      </div>
    </div>
    <div className={`transition-all duration-300 ${!isOn && !noToggle ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
      {children}
    </div>
  </section>
);

const SiteSettings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState({});
  const [displayTime, setDisplayTime] = useState(60);
  const [timeUnit, setTimeUnit] = useState(1);

  const [config, setConfig] = useState({
    system: { booking: true, purchasing: true, autoCancelMinutes: 60 },
    branding: { siteName: '', showSiteName: true, logo: null, showLogo: true },
    hero: {
      line1: { text: '', color: '#000000', show: true },
      line2: { text: '', color: '#3B82F6', show: true, aurora: true },
      line3: { text: '', color: '#000000', show: true },
      subText: { show: true, text: '' }
    },
    stats: { show: true, items: [] },
    agenda: { show: true, items: [] },
    gallery: { show: true, items: [] },
    faq: { show: true, items: [] },
    line: { show: true, id: '', qrCode: null },
    payment: { show: true, bank: '', accountName: '', accountNumber: '' },
    footer: {
      show: true,
      text: { show: true, content: '' },
      social: { facebook: { url: '', show: true }, instagram: { url: '', show: true }, twitter: { url: '', show: true }, website: { url: '', show: true } },
      contact: { address: { text: '', show: true }, phone: { text: '', show: true }, email: { text: '', show: true } }
    }
  });


  const updateTimeConfig = (val, unit) => {
    const numVal = parseInt(val) || 0;
    setDisplayTime(numVal);
    setTimeUnit(unit);
    
    setConfig(prev => ({
        ...prev,
        system: {
            ...prev.system,
            autoCancelMinutes: numVal * unit
        }
    }));
  };

  useEffect(() => { fetchSettings(); }, []);
  useEffect(() => {
    if (!config.system.autoCancelMinutes) return;
    const minutes = config.system.autoCancelMinutes;

    // Logic แปลงหน่วย (นาที -> ชม. -> วัน)
    if (minutes % 10080 === 0) { setDisplayTime(minutes / 10080); setTimeUnit(10080); }
    else if (minutes % 1440 === 0) { setDisplayTime(minutes / 1440); setTimeUnit(1440); }
    else if (minutes % 60 === 0) { setDisplayTime(minutes / 60); setTimeUnit(60); }
    else { setDisplayTime(minutes); setTimeUnit(1); }
  }, [config.system.autoCancelMinutes]); // ทำงานเมื่อค่า config เปลี่ยน

  const fetchSettings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setConfig(prev => {
          const newConfig = { ...prev, ...data };
          if (!newConfig.hero.line2) newConfig.hero.line2 = prev.hero.line2;
          if (newConfig.hero.line2.aurora === undefined) newConfig.hero.line2.aurora = true;
          if (!newConfig.footer) newConfig.footer = prev.footer;
          if (!newConfig.footer.social) newConfig.footer.social = prev.footer.social;
          if (!newConfig.footer.contact) newConfig.footer.contact = prev.footer.contact;
          ['facebook', 'instagram', 'twitter', 'website'].forEach(k => {
            if (!newConfig.footer.social[k]) newConfig.footer.social[k] = prev.footer.social[k];
          });
          ['address', 'phone', 'email'].forEach(k => {
            if (!newConfig.footer.contact[k]) newConfig.footer.contact[k] = prev.footer.contact[k];
          });
          if (newConfig.gallery && newConfig.gallery.items) {
            newConfig.gallery.items = newConfig.gallery.items.filter(item => !item.startsWith('blob:'));
          }
          return newConfig;
        });
      }
    } catch (error) { console.error(error); } finally { setFetching(false); }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/settings/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.filename;
  };

  const handleSave = async (e, goHome = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      let finalConfig = { ...config };
      if (logoFile) finalConfig.branding.logo = await uploadFile(logoFile);
      if (qrFile) finalConfig.line.qrCode = await uploadFile(qrFile);
      const updatedGalleryItems = await Promise.all(finalConfig.gallery.items.map(async (item) => {
        if (item.startsWith('blob:') && newGalleryFiles[item]) {
          try { return await uploadFile(newGalleryFiles[item]); } catch (err) { return null; }
        }
        if (item.startsWith('blob:')) return null;
        return item;
      }));
      finalConfig.gallery.items = updatedGalleryItems.filter(item => item !== null);

      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(finalConfig)
      });
      if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');
      setConfig(finalConfig);
      addToast('บันทึกข้อมูลเรียบร้อย ✅', 'success');
      setLogoFile(null); setQrFile(null); setNewGalleryFiles({});
      if (goHome) window.location.href = '/';
    } catch (error) { addToast('เกิดข้อผิดพลาด: ' + error.message, 'error'); } finally { setLoading(false); }
  };

  const addArrayItem = (key, defaultItem) => {
    setConfig(prev => ({ ...prev, [key]: { ...prev[key], items: [...prev[key].items, defaultItem] } }));
  };
  const removeArrayItem = (key, index) => {
    setConfig(prev => ({ ...prev, [key]: { ...prev[key], items: prev[key].items.filter((_, i) => i !== index) } }));
  };
  const updateArrayItem = (key, index, field, value) => {
    setConfig(prev => {
      const newItems = [...prev[key].items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, [key]: { ...prev[key], items: newItems } };
    });
  };

  const getGalleryImageUrl = (src) => {
    if (!src) return '';
    if (src.startsWith('blob:') || src.startsWith('http')) return src;
    const serverUrl = API_BASE_URL.replace('/api', '');
    return `${serverUrl}/uploads/site/photos/${src}`;
  };

  if (fetching) return <div className="p-10 text-center text-gray-500 dark:text-slate-400"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="w-full px-2 md:px-6 pb-24">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
          <Layout className="text-blue-600 dark:text-blue-400" /> ตั้งค่าหน้าเว็บไซต์
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={(e) => handleSave(e, true)} disabled={loading} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-50">
            <ExternalLink size={18} /> บันทึกและกลับหน้าเว็บ
          </button>
          <button onClick={(e) => handleSave(e, false)} disabled={loading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>บันทึก</span>
          </button>
        </div>
      </div>

      <form className="space-y-8">

        {/* 1. System Status */}
        <SectionCard icon={ToggleLeft} title="สถานะระบบ" isOn={true} noToggle={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700">
              <div><span className="font-bold text-gray-700 dark:text-white block">ระบบจองโต๊ะ (Booking)</span><span className="text-xs text-gray-400 dark:text-slate-500">ปิด: ซ่อนปุ่มจอง / เข้าหน้าจองไม่ได้</span></div>
              <Toggle checked={config.system.booking} onChange={v => setConfig({ ...config, system: { ...config.system, booking: v } })} />
            </div>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700">
              <div><span className="font-bold text-gray-700 dark:text-white block">ระบบสั่งซื้อของ (Shop)</span><span className="text-xs text-gray-400 dark:text-slate-500">ปิด: ซ่อนปุ่มร้านค้า / เข้าหน้าร้านไม่ได้</span></div>
              <Toggle checked={config.system.purchasing} onChange={v => setConfig({ ...config, system: { ...config.system, purchasing: v } })} />
            </div>
          </div>

          <div className="mt-6 bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <Clock size={20} /> ตัดสิทธิ์การจองอัตโนมัติ
              </h4>
              <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">
                หากไม่ชำระเงินภายในเวลาที่กำหนด ระบบจะยกเลิกการจองและคืนโต๊ะทันที
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
              {/* ช่องกรอกตัวเลข */}
              <input
                type="number"
                min="1"
                value={displayTime}
                onChange={e => updateTimeConfig(e.target.value, timeUnit)}
                className="w-20 p-2 text-center font-bold text-lg rounded-lg bg-transparent text-red-700 dark:text-white outline-none"
              />

              {/* Dropdown เลือกหน่วย */}
              <div className="relative">
                <select
                  value={timeUnit}
                  onChange={e => updateTimeConfig(displayTime, parseInt(e.target.value))}
                  className="appearance-none bg-red-50 dark:bg-slate-800 text-red-700 dark:text-red-400 font-bold text-sm py-2 pl-3 pr-8 rounded-lg outline-none cursor-pointer hover:bg-red-100 dark:hover:bg-slate-700 transition"
                >
                  <option value={1}>นาที</option>
                  <option value={60}>ชั่วโมง</option>
                  <option value={1440}>วัน</option>
                  <option value={10080}>สัปดาห์</option>
                </select>
                {/* ลูกศรตกแต่ง */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-red-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>



        {/* 2. Branding & Header */}
        <SectionCard icon={Palette} title="Branding & Header" isOn={true} noToggle={true}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2"><label className="text-sm font-bold text-gray-500 dark:text-slate-400">โลโก้เว็บ</label><MiniToggle checked={config.branding.showLogo} onChange={v => setConfig({ ...config, branding: { ...config.branding, showLogo: v } })} /></div>
                <div className={!config.branding.showLogo ? 'opacity-40 pointer-events-none grayscale' : ''}>
                  <ImageUpload label="อัปโหลดโลโก้" preview={config.branding.logo} onFileChange={(e) => { const file = e.target.files[0]; if (file) { setLogoFile(file); setConfig({ ...config, branding: { ...config.branding, logo: URL.createObjectURL(file) } }); } }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2"><label className="text-sm font-bold text-gray-500 dark:text-slate-400">ชื่อเว็บไซต์</label><MiniToggle checked={config.branding.showSiteName} onChange={v => setConfig({ ...config, branding: { ...config.branding, showSiteName: v } })} /></div>
                <input type="text" value={config.branding.siteName} disabled={!config.branding.showSiteName} onChange={e => setConfig({ ...config, branding: { ...config.branding, siteName: e.target.value } })} className={`w-full p-3 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-none font-bold text-gray-900 dark:text-white ${!config.branding.showSiteName ? 'opacity-50' : ''}`} />
              </div>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <label className="block text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">ข้อความส่วนหัว</label>
              {[1, 2, 3].map(num => (
                <div key={num} className={`bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border ${config.hero[`line${num}`].show ? 'border-gray-200 dark:border-slate-700' : 'border-dashed border-gray-300 dark:border-slate-600 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Line {num}</span>
                    <div className="flex items-center gap-3">
                      {num === 2 && (
                        <MiniToggle label="✨ ใช้สีแสงเหนือ" checked={config.hero.line2.aurora} onChange={v => setConfig({ ...config, hero: { ...config.hero, line2: { ...config.hero.line2, aurora: v } } })} />
                      )}
                      <MiniToggle checked={config.hero[`line${num}`].show} onChange={v => setConfig({ ...config, hero: { ...config.hero, [`line${num}`]: { ...config.hero[`line${num}`], show: v } } })} />
                    </div>
                  </div>
                  <div className={`flex flex-col sm:flex-row gap-4 items-center ${!config.hero[`line${num}`].show ? 'pointer-events-none' : ''}`}>
                    <input type="text" value={config.hero[`line${num}`].text} onChange={e => setConfig({ ...config, hero: { ...config.hero, [`line${num}`]: { ...config.hero[`line${num}`], text: e.target.value } } })} className="w-full p-2 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg outline-none font-bold text-lg text-gray-900 dark:text-white" />
                    <div className="shrink-0 relative">
                      {num === 2 && config.hero.line2.aurora && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 cursor-not-allowed" title="ปิดแสงเหนือก่อน" />}
                      <ColorPicker selected={config.hero[`line${num}`].color} onChange={c => setConfig({ ...config, hero: { ...config.hero, [`line${num}`]: { ...config.hero[`line${num}`], color: c } } })} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-gray-500 dark:text-slate-400">ข้อความรอง</span><MiniToggle checked={config.hero.subText.show} onChange={v => setConfig({ ...config, hero: { ...config.hero, subText: { ...config.hero.subText, show: v } } })} /></div>
                <div className={!config.hero.subText.show ? 'opacity-40 pointer-events-none' : ''}><textarea rows="2" value={config.hero.subText.text} onChange={e => setConfig({ ...config, hero: { ...config.hero, subText: { ...config.hero.subText, text: e.target.value } } })} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-white" /></div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 3. STATS */}
        <SectionCard icon={Layout} title="Post-it Highlights" isOn={config.stats.show} onToggle={v => setConfig({ ...config, stats: { ...config.stats, show: v } })} action={<button type="button" onClick={() => addArrayItem('stats', { id: Date.now(), icon: 'Star', val: '0', label: 'New', color: '#FEF08A' })} disabled={!config.stats.show} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50">+ เพิ่ม</button>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {config.stats.items.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-xl relative group hover:shadow-md transition border border-gray-200 dark:border-slate-700" style={{ backgroundColor: item.color || '#FFFFFF' }}>
                <button type="button" onClick={() => removeArrayItem('stats', idx)} className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 z-10"><Trash2 size={14} /></button>

                <div className="mb-3">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase block mb-1">เลือกไอคอน</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {iconOptions.map(({ id, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateArrayItem('stats', idx, 'icon', id)}
                        className={`p-2 rounded-lg transition shrink-0 ${item.icon === id ? 'bg-black text-white' : 'bg-white/50 hover:bg-white text-slate-600'}`}
                        title={id}
                      >
                        <Icon size={18} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Input พื้นหลังโปร่งใสเพื่อให้เข้ากับสี Post-it */}
                  <input type="text" value={item.val} onChange={e => updateArrayItem('stats', idx, 'val', e.target.value)} className="bg-white/60 border-none rounded p-1 text-sm font-bold w-full focus:ring-2 focus:ring-black/10 text-black" placeholder="Value (e.g. 500+)" />
                  <input type="text" value={item.label} onChange={e => updateArrayItem('stats', idx, 'label', e.target.value)} className="bg-white/60 border-none rounded p-1 text-sm w-full focus:ring-2 focus:ring-black/10 text-black" placeholder="Label" />
                </div>

                <div className="mt-3 border-t border-black/10 pt-2">
                  <ColorPicker selected={item.color} onChange={c => updateArrayItem('stats', idx, 'color', c)} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 4. Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SectionCard icon={Clock} title="กำหนดการ" isOn={config.agenda.show} onToggle={v => setConfig({ ...config, agenda: { ...config.agenda, show: v } })} action={<button type="button" onClick={() => addArrayItem('agenda', { time: '09:00', title: 'กิจกรรม', desc: '' })} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50">+ เพิ่มเวลา</button>}>
            <div className="space-y-3">
              {config.agenda.items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 relative group">
                  <div className="w-full sm:w-auto">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">เวลา</label>
                    <input type="text" value={item.time} onChange={e => updateArrayItem('agenda', idx, 'time', e.target.value)} className="bg-white dark:bg-slate-900 border dark:border-slate-600 rounded p-2 text-sm font-bold w-full text-center text-gray-900 dark:text-white" placeholder="09:00" />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div><label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">หัวข้อ (โชว์ตลอด)</label><input type="text" value={item.title} onChange={e => updateArrayItem('agenda', idx, 'title', e.target.value)} className="w-full bg-white dark:bg-slate-900 border dark:border-slate-600 rounded p-2 text-sm font-bold text-gray-900 dark:text-white" /></div>
                    <div><label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">รายละเอียด (ซ่อนไว้กดดู)</label><textarea rows="2" value={item.desc} onChange={e => updateArrayItem('agenda', idx, 'desc', e.target.value)} className="w-full bg-white dark:bg-slate-900 border dark:border-slate-600 rounded p-2 text-sm text-gray-500 dark:text-slate-400" placeholder="พิมพ์รายละเอียดยาวๆ ตรงนี้..." /></div>
                  </div>
                  <button type="button" onClick={() => removeArrayItem('agenda', idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 5. Gallery */}
          <SectionCard icon={ImageIcon} title="Memory Lane (รูปภาพ)" isOn={config.gallery.show} onToggle={v => setConfig({ ...config, gallery: { ...config.gallery, show: v } })}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {config.gallery.items.map((img, idx) => (
                <div key={idx} className="relative aspect-video bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden group border border-gray-200 dark:border-slate-700">
                  <img src={getGalleryImageUrl(img)} alt="gallery" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x300?text=No+Image"; }} />
                  <button type="button" onClick={() => removeArrayItem('gallery', idx)} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm z-10 hover:bg-red-600"><X size={14} /></button>
                </div>
              ))}
              <label className="aspect-video border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition bg-white dark:bg-slate-900 relative">
                <Plus size={24} className="text-gray-400 dark:text-slate-500" />
                <span className="text-xs text-gray-400 dark:text-slate-500 mt-1">เพิ่มรูป (ได้หลายรูป)</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                      const newBlobs = {};
                      const newItems = files.map(file => {
                        const blobUrl = URL.createObjectURL(file);
                        newBlobs[blobUrl] = file;
                        return blobUrl;
                      });
                      setNewGalleryFiles(prev => ({ ...prev, ...newBlobs }));
                      setConfig(prev => ({ ...prev, gallery: { ...prev.gallery, items: [...prev.gallery.items, ...newItems] } }));
                    }
                  }}
                />
              </label>
            </div>
          </SectionCard>
        </div>

        {/* FAQ */}
        <SectionCard icon={HelpCircle} title="FAQ" isOn={config.faq.show} onToggle={v => setConfig({ ...config, faq: { ...config.faq, show: v } })} action={<button type="button" onClick={() => addArrayItem('faq', { question: '', answer: '' })} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50">+ เพิ่ม</button>}>
          <div className="space-y-4">{config.faq.items.map((item, idx) => (<div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-xl p-3 relative bg-gray-50 dark:bg-slate-800 group"><button type="button" onClick={() => removeArrayItem('faq', idx)} className="absolute top-2 right-2 text-gray-400 dark:text-slate-500 hover:text-red-500"><X size={18} /></button><input type="text" value={item.question} onChange={e => updateArrayItem('faq', idx, 'question', e.target.value)} className="w-[90%] font-bold text-gray-800 dark:text-white mb-2 outline-none border-b border-transparent focus:border-blue-300 text-sm bg-transparent" placeholder="คำถาม" /><textarea rows="2" value={item.answer} onChange={e => updateArrayItem('faq', idx, 'answer', e.target.value)} className="w-full text-gray-600 dark:text-slate-300 text-sm outline-none resize-none bg-white dark:bg-slate-900 p-2 rounded border border-gray-200 dark:border-slate-600" placeholder="คำตอบ" /></div>))}</div>
        </SectionCard>

        {/* FOOTER ZONE */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SectionCard icon={MessageCircle} title="Line Contact" isOn={config.line.show} onToggle={v => setConfig({ ...config, line: { ...config.line, show: v } })}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-green-50/50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/30">
                <div className="text-center"><label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-2">QR Code</label><div className="w-40 mx-auto"><ImageUpload label="อัปโหลด QR" preview={config.line.qrCode} onFileChange={e => { const file = e.target.files[0]; if (file) { setQrFile(file); setConfig({ ...config, line: { ...config.line, qrCode: URL.createObjectURL(file) } }); } }} /></div></div>
                <div><label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-2">Line ID</label><input type="text" value={config.line.id} onChange={e => setConfig({ ...config, line: { ...config.line, id: e.target.value } })} className="w-full p-3 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-400 font-bold outline-none" /></div>
              </div>
            </SectionCard>

            <SectionCard icon={CreditCard} title="ข้อมูลชำระเงิน (Payment)" isOn={true} noToggle={true}>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">ชื่อธนาคาร</label><input type="text" value={config.payment.bank} onChange={e => setConfig({ ...config, payment: { ...config.payment, bank: e.target.value } })} className="w-full p-2 border dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 font-bold text-gray-900 dark:text-white" /></div>
                  <div><label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">ชื่อบัญชี</label><input type="text" value={config.payment.accountName} onChange={e => setConfig({ ...config, payment: { ...config.payment, accountName: e.target.value } })} className="w-full p-2 border dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div>
                  <div><label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">เลขที่บัญชี</label><input type="text" value={config.payment.accountNumber} onChange={e => setConfig({ ...config, payment: { ...config.payment, accountNumber: e.target.value } })} className="w-full p-2 border dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 font-mono text-gray-900 dark:text-white" /></div>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard icon={Share2} title="Footer" isOn={config.footer.show} onToggle={v => setConfig({ ...config, footer: { ...config.footer, show: v } })}>
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700"><div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-gray-500 dark:text-slate-400">ข้อความ Footer</label><MiniToggle checked={config.footer.text.show} onChange={v => setConfig({ ...config, footer: { ...config.footer, text: { ...config.footer.text, show: v } } })} /></div><div className={!config.footer.text.show ? 'opacity-40 pointer-events-none' : ''}><textarea rows="2" value={config.footer.text.content} onChange={e => setConfig({ ...config, footer: { ...config.footer, text: { ...config.footer.text, content: e.target.value } } })} className="w-full p-3 bg-white dark:bg-slate-900 border dark:border-slate-600 rounded-xl outline-none text-sm text-gray-900 dark:text-white" /></div></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700"><h4 className="font-bold text-gray-700 dark:text-white mb-3 flex items-center gap-2"><Globe size={16} /> Social Links</h4><div className="space-y-3">{[{ key: 'facebook', icon: Facebook }, { key: 'instagram', icon: Instagram }, { key: 'twitter', icon: Twitter }, { key: 'website', icon: Globe }].map((s) => (<div key={s.key} className="flex gap-2 items-center"><s.icon size={18} className="text-gray-400 dark:text-slate-500 shrink-0" /><div className={`flex-1 ${!config.footer.social[s.key].show ? 'opacity-40 pointer-events-none' : ''}`}><input type="text" placeholder={`${s.key} URL`} value={config.footer.social[s.key].url} onChange={e => setConfig({ ...config, footer: { ...config.footer, social: { ...config.footer.social, [s.key]: { ...config.footer.social[s.key], url: e.target.value } } } })} className="flex-1 p-2 border dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white" /></div><MiniToggle checked={config.footer.social[s.key].show} onChange={v => setConfig({ ...config, footer: { ...config.footer, social: { ...config.footer.social, [s.key]: { ...config.footer.social[s.key], show: v } } } })} /></div>))}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700"><h4 className="font-bold text-gray-700 dark:text-white mb-3 flex items-center gap-2"><Phone size={16} /> ข้อมูลติดต่อ</h4><div className="space-y-3">{[{ key: 'address', icon: MapPin }, { key: 'phone', icon: Phone }, { key: 'email', icon: Mail }].map((c) => (<div key={c.key} className="flex gap-2 items-center"><c.icon size={18} className="text-gray-400 dark:text-slate-500 shrink-0" /><div className={`flex-1 ${!config.footer.contact[c.key].show ? 'opacity-40 pointer-events-none' : ''}`}><input type="text" value={config.footer.contact[c.key].text} onChange={e => setConfig({ ...config, footer: { ...config.footer, contact: { ...config.footer.contact, [c.key]: { ...config.footer.contact[c.key], text: e.target.value } } } })} className="w-full p-2 border dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white" placeholder={c.key} /></div><MiniToggle checked={config.footer.contact[c.key].show} onChange={v => setConfig({ ...config, footer: { ...config.footer, contact: { ...config.footer.contact, [c.key]: { ...config.footer.contact[c.key], show: v } } } })} /></div>))}</div></div>
              </div>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
};

export default SiteSettings;