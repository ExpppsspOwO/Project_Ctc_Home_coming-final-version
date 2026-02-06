// src/components/admin/ZoneGenerator.jsx
import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
// ผมเปลี่ยนมาใช้ html input ธรรมดาแทนการ import Input เพื่อให้ชัวร์เรื่องสี Dark Mode ครับ

const ZoneGenerator = () => {
  const [formData, setFormData] = useState({ zoneName: '', price: 0 });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [grid, setGrid] = useState({ hoverRow: 0, hoverCol: 0, selectedRow: 0, selectedCol: 0 });
  const [viewSize, setViewSize] = useState({ rows: 10, cols: 10 });

  const handleMouseEnter = (r, c) => {
    setGrid((prev) => ({ ...prev, hoverRow: r, hoverCol: c }));
    const targetRows = Math.max(10, grid.selectedRow + 1, r + 1);
    const targetCols = Math.max(10, grid.selectedCol + 1, c + 1);
    setViewSize({ rows: Math.min(targetRows, 50), cols: Math.min(targetCols, 50) });
  };

  const handleMouseLeave = () => {
    setGrid((prev) => ({ ...prev, hoverRow: 0, hoverCol: 0 }));
    setViewSize({ rows: Math.max(10, grid.selectedRow + 1), cols: Math.max(10, grid.selectedCol + 1) });
  };

  const handleClick = (r, c) => {
    setGrid((prev) => ({ ...prev, selectedRow: r, selectedCol: c }));
  };

  const handleManualInputChange = (field, value) => {
    const val = parseInt(value) || 0;
    setGrid(prev => {
      const newGrid = { ...prev, [field === 'rows' ? 'selectedRow' : 'selectedCol']: val };
      setViewSize({
        rows: Math.max(10, field === 'rows' ? val + 1 : Math.max(10, viewSize.rows)),
        cols: Math.max(10, field === 'columns' ? val + 1 : Math.max(10, viewSize.cols))
      });
      return newGrid;
    });
  };

  const isActive = (r, c) => {
    const targetR = grid.hoverRow > 0 ? grid.hoverRow : grid.selectedRow;
    const targetC = grid.hoverCol > 0 ? grid.hoverCol : grid.selectedCol;
    return r <= targetR && c <= targetC;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.zoneName) return setStatus({ type: 'error', message: 'กรุณากรอกชื่อโซน' });
    if (grid.selectedRow === 0 || grid.selectedCol === 0) return setStatus({ type: 'error', message: 'กรุณาระบุขนาด' });

    const token = localStorage.getItem('token');
    if (!token) return alert('กรุณาเข้าสู่ระบบก่อน (Admin Only)!');

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // ✅ ใช้ URL เดิมของคุณ ไม่แตะต้อง Logic
      const response = await fetch(`${API_BASE_URL}/tables/add-zone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          zoneName: formData.zoneName,
          rows: grid.selectedRow,
          columns: grid.selectedCol,
          price: Number(formData.price)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
      setStatus({ type: 'success', message: `สร้างโซน ${formData.zoneName} สำเร็จ! (${data.count || 0} โต๊ะ)` });
      setFormData({ ...formData, zoneName: '' });
      setGrid({ hoverRow: 0, hoverCol: 0, selectedRow: 0, selectedCol: 0 });
      setViewSize({ rows: 10, cols: 10 });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-20">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">สร้างผังที่นั่ง (Zone Generator) 🏗️</h2>
      </div>

      {status.message && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          <span>{status.type === 'success' ? '✅' : '⚠️'}</span> {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 h-fit transition-colors">
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-gray-700 dark:text-white mb-2 border-b dark:border-slate-700 pb-2">ตั้งค่าโซน</h3>
            
            {/* Zone Name */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">ชื่อโซน (เช่น A, VIP)</label>
                <input 
                    type="text" 
                    value={formData.zoneName} 
                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value.toUpperCase() })} 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    placeholder="Ex. A"
                />
            </div>

            {/* Rows & Columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">จำนวนแถว</label>
                <input 
                    type="number" 
                    value={grid.selectedRow || ''} 
                    onChange={(e) => handleManualInputChange('rows', e.target.value)} 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">จำนวนคอลัมน์</label>
                <input 
                    type="number" 
                    value={grid.selectedCol || ''} 
                    onChange={(e) => handleManualInputChange('columns', e.target.value)} 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Price */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">ราคา (บาท)</label>
                <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{grid.selectedRow * grid.selectedCol}</div>
              <p className="text-xs text-gray-500 dark:text-slate-400">จำนวนโต๊ะทั้งหมด</p>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:opacity-50">
              {loading ? 'กำลังสร้าง...' : '💾 บันทึกโซนนี้'}
            </button>
          </div>
        </div>

        {/* Grid Visualizer */}
        <div className="lg:col-span-8 flex flex-col items-center bg-gray-50 dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
          <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-slate-300">
            ขนาดปัจจุบัน: <span className="text-blue-600 dark:text-blue-400">{(grid.hoverRow || grid.selectedRow)} x {(grid.hoverCol || grid.selectedCol)}</span>
          </p>
          <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-sm overflow-auto max-w-full max-h-[500px] border border-gray-300 dark:border-slate-600 transition-all duration-75" onMouseLeave={handleMouseLeave}>
            {Array.from({ length: viewSize.rows }, (_, rowIndex) => {
              const r = rowIndex + 1;
              return (
                <div key={r} className="flex">
                  {Array.from({ length: viewSize.cols }, (_, colIndex) => {
                    const c = colIndex + 1;
                    const active = isActive(r, c);
                    return (
                      <div key={`${r}-${c}`} onMouseEnter={() => handleMouseEnter(r, c)} onClick={() => handleClick(r, c)}
                        className={`w-8 h-8 m-[2px] border rounded-[4px] cursor-pointer transition-colors ${active ? 'bg-blue-500 border-blue-600 dark:bg-blue-600 dark:border-blue-500' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'}`}
                      ></div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">ลากเมาส์เพื่อเลือกขนาด หรือพิมพ์ตัวเลขได้เลย</p>
        </div>
      </div>
    </div>
  );
};

export default ZoneGenerator;