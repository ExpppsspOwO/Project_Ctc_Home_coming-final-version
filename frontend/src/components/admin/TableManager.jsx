import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, Plus, Trash2, CheckSquare, Square,
    AlertTriangle, Loader2, Info, Map as MapIcon, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { useToast } from '../../context/ToastContext';
import MiniMap from '../../components/MiniMap'; // ✅ ตรวจสอบ path ให้ถูกนะครับ

const TableManager = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Data State
    const [allTables, setAllTables] = useState([]);
    const [filteredTables, setFilteredTables] = useState([]);
    const [zones, setZones] = useState([]);
    const [activeZone, setActiveZone] = useState('');
    const [loading, setLoading] = useState(true);

    // UI State (MiniMap เปิด Default)
    const [showMiniMap, setShowMiniMap] = useState(true);

    // Actions State
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTableConfig, setNewTableConfig] = useState({
        row: '', column: '', price: 0
    });

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (allTables.length > 0) {
            const uniqueZones = [...new Set(allTables.map(t => t.zone))].sort();
            setZones(uniqueZones);

            if (!activeZone && uniqueZones.length > 0) {
                setActiveZone(uniqueZones[0]);
            }

            const filtered = activeZone
                ? allTables.filter(t => t.zone === activeZone)
                : allTables;

            // เรียงตาม Row -> Col
            filtered.sort((a, b) => (a.row - b.row) || (a.column - b.column));

            setFilteredTables(filtered);

            // ดึงราคาเริ่มต้นจากโซน
            if (filtered.length > 0) {
                setNewTableConfig(prev => ({ ...prev, price: filtered[0].price }));
            }

        } else {
            setZones([]);
            setFilteredTables([]);
        }
    }, [allTables, activeZone]);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/tables`);
            const data = await res.json();
            setAllTables(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            addToast('โหลดข้อมูลโต๊ะไม่สำเร็จ', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
        else setSelectedIds(prev => [...prev, id]);
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`ยืนยันลบโต๊ะ ${selectedIds.length} รายการ?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/tables/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ids: selectedIds })
            });
            if (!res.ok) throw new Error('ลบไม่สำเร็จ');
            addToast(`ลบเรียบร้อย ${selectedIds.length} รายการ`, 'success');
            fetchTables();
            setSelectedIds([]);
            setIsDeleteMode(false);
        } catch (error) {
            addToast(error.message, 'error');
        }
    };

    const handleDeleteZone = async () => {
        const confirmText = prompt(`⚠️ อันตราย! พิมพ์ชื่อโซน "${activeZone}" เพื่อยืนยันการลบทั้งโซน`);
        if (confirmText !== activeZone) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/tables/zone/${activeZone}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('ลบโซนไม่สำเร็จ');
            addToast(`ลบโซน ${activeZone} เรียบร้อย`, 'success');
            setActiveZone('');
            fetchTables();
        } catch (error) {
            addToast(error.message, 'error');
        }
    };

    const handleAddTable = async () => {
        if (!newTableConfig.row || !newTableConfig.column) {
            addToast('กรุณาระบุแถวและคอลัมน์', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/tables/add-table`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    zone: activeZone,
                    row: newTableConfig.row,
                    column: newTableConfig.column,
                    price: newTableConfig.price
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'สร้างไม่สำเร็จ');

            addToast(data.message, 'success');
            setShowAddModal(false);
            fetchTables();
            setNewTableConfig(prev => ({ ...prev, row: '', column: '' }));
        } catch (error) {
            addToast(error.message, 'error');
        }
    };

    if (loading && allTables.length === 0) return (
        <div className="flex justify-center pt-20">
            <Loader2 className="animate-spin text-slate-400 dark:text-slate-500" />
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="p-4 md:p-8 space-y-6 flex-1 overflow-y-auto">

                {/* Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            {activeZone ? `Zone ${activeZone}` : 'จัดการผังที่นั่ง'}
                            {activeZone && <span className="text-lg font-normal text-slate-400 dark:text-slate-500">| ราคา: {filteredTables[0]?.price?.toLocaleString() || '-'} บ.</span>}
                        </h1>
                    </div>

                    {/* Legend (Dark Mode Ready) */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-emerald-400 bg-white dark:bg-emerald-950/30"></div><span className="text-xs font-bold text-slate-600 dark:text-slate-300">ว่าง</span></div>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-amber-300 bg-amber-50 dark:bg-amber-900/20"></div><span className="text-xs font-bold text-slate-600 dark:text-slate-300">รอโอน</span></div>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600"></div><span className="text-xs font-bold text-slate-600 dark:text-slate-300">เต็ม</span></div>
                    </div>
                </div>

                {/* Zone Tabs & Tools */}
                <div className="flex flex-wrap items-center gap-2">
                    {zones.map(z => (
                        <button
                            key={z}
                            onClick={() => setActiveZone(z)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${activeZone === z
                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 ring-2 ring-slate-800 dark:ring-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                        >
                            {z}
                        </button>
                    ))}
                    <button onClick={() => navigate('/dashboard/zones')} className="px-3 py-2 bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition" title="ไปหน้าสร้างผัง"><Plus size={18} /></button>
                </div>

                {/* Toolbar */}
                {activeZone && (
                    <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition shadow-sm active:scale-95"
                            >
                                <Plus size={18} /> เติมโต๊ะ
                            </button>
                            <button
                                onClick={() => { setIsDeleteMode(!isDeleteMode); setSelectedIds([]); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition border ${isDeleteMode
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                    }`}
                            >
                                {isDeleteMode ? 'ยกเลิกโหมดลบ' : 'ลบหลายรายการ'}
                            </button>
                            <button
                                onClick={() => setShowMiniMap(!showMiniMap)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition border ${showMiniMap
                                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                                    }`}
                            >
                                <MapIcon size={18} /> {showMiniMap ? 'ซ่อนผัง' : 'ดูผัง'}
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {isDeleteMode && selectedIds.length > 0 && (
                                <button onClick={handleDeleteSelected} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold animate-in fade-in zoom-in shadow-lg">
                                    <Trash2 size={18} /> ลบ {selectedIds.length} รายการ
                                </button>
                            )}
                            <button onClick={handleDeleteZone} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition border border-transparent hover:border-red-200 dark:hover:border-red-900/50">
                                <AlertTriangle size={18} /> ล้างโซน
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* Tables Grid */}
                    <div className="flex-1 w-full">
                        {filteredTables.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                                {filteredTables.map(table => (
                                    <motion.div
                                        key={table._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -3 }}
                                        onClick={() => isDeleteMode && toggleSelect(table._id)}
                                        className={`relative aspect-square rounded-[1.5rem] border-[3px] flex flex-col items-center justify-center cursor-pointer transition-all group shadow-sm overflow-hidden
                                            ${isDeleteMode
                                                ? (selectedIds.includes(table._id) ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500')
                                                : (table.status === 'booked'
                                                    ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : (table.status === 'paid'
                                                        ? 'border-blue-600 bg-blue-500 text-white dark:border-blue-500 dark:bg-blue-600'
                                                        : 'border-emerald-400 bg-white text-emerald-600 hover:border-emerald-500 hover:shadow-emerald-100 dark:bg-slate-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:border-emerald-600'))
                                            }
                                        `}
                                    >
                                        {isDeleteMode && (
                                            <div className="absolute top-2 right-2 z-10">
                                                {selectedIds.includes(table._id) ? <CheckSquare size={20} className="text-red-500" /> : <Square size={20} className="text-slate-300 dark:text-slate-600" />}
                                            </div>
                                        )}

                                        {/* Status Icon (Booked) - ซ่อนตอนโหมดลบ */}
                                        {!isDeleteMode && table.status === 'booked' && (
                                            <div className="absolute top-2 right-2 text-amber-500 bg-white dark:bg-slate-800 rounded-full p-0.5"><Info size={14} /></div>
                                        )}

                                        {/* ✅✅✅ แก้ไขจุดที่ 1: เบอร์โต๊ะ ✅✅✅ */}
                                        {/* ถ้าอยู่โหมดลบ ให้ใช้สีชัดๆ (slate-800/slate-100) ถ้าโหมดปกติให้ใช้ตรรกะเดิม */}
                                        <span className={`text-lg font-black tracking-tight ${isDeleteMode
                                                ? 'text-slate-800 dark:text-slate-100'
                                                : (table.status === 'paid' ? 'text-white' : '')
                                            }`}>
                                            {table.tableNumber}
                                        </span>

                                        {/* ✅✅✅ แก้ไขจุดที่ 2: ข้อความสถานะด้านล่าง ✅✅✅ */}
                                        {/* ถ้าอยู่โหมดลบ ให้ใช้สีชัดๆ (slate-600/slate-300) ถ้าโหมดปกติให้ใช้สีตามสถานะเดิม */}
                                        <span className={`text-[10px] font-bold mt-1 
                                            ${isDeleteMode
                                                ? 'text-slate-600 dark:text-slate-300'
                                                : (table.status === 'booked' ? 'text-amber-600 dark:text-amber-400' :
                                                    table.status === 'paid' ? 'text-blue-100' : 'text-emerald-500 dark:text-emerald-400')
                                            }
                                            `}>
                                            {table.status === 'available' ? 'ว่าง' :
                                                table.status === 'booked' ? 'รอชำระเงิน' :
                                                    table.status === 'paid' ? 'เต็มแล้ว' : ''}
                                        </span>

                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 opacity-50 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                <LayoutGrid size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                                <p className="text-slate-500 dark:text-slate-400">ยังไม่มีข้อมูลโต๊ะในโซนนี้</p>
                            </div>
                        )}
                    </div>

                    {/* ✅ MiniMap (Sticky Side) */}
                    <MiniMap tables={filteredTables} isVisible={showMiniMap} onClose={() => setShowMiniMap(false)} />
                </div>
            </div>

            {/* Modal: Add Single Table */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <h3 className="text-xl font-bold mb-1 text-slate-800 dark:text-white">เพิ่มโต๊ะใน Zone {activeZone}</h3>
                            <p className="text-xs text-slate-400 mb-6">ระบุพิกัดแถวและคอลัมน์เพื่อสร้างโต๊ะ</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-slate-500 dark:text-slate-400">แถว (Row)</label>
                                        <input
                                            type="number" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold text-center"
                                            placeholder="เช่น 1"
                                            value={newTableConfig.row}
                                            onChange={e => setNewTableConfig({ ...newTableConfig, row: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-slate-500 dark:text-slate-400">คอลัมน์ (Col)</label>
                                        <input
                                            type="number" className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold text-center"
                                            placeholder="เช่น 5"
                                            value={newTableConfig.column}
                                            onChange={e => setNewTableConfig({ ...newTableConfig, column: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex items-center justify-center gap-2 border border-blue-100 dark:border-blue-800">
                                    <span className="text-xs text-blue-500 dark:text-blue-400 font-bold">ชื่อโต๊ะที่จะได้:</span>
                                    <span className="text-lg font-black text-blue-700 dark:text-blue-300">
                                        {activeZone} : {newTableConfig.row || '?'}-{newTableConfig.column || '?'}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">ราคา</label>
                                        <span className="text-[10px] text-emerald-500 font-medium">ดึงจากโซน {activeZone}</span>
                                    </div>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number" className="w-full pl-9 p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                            value={newTableConfig.price}
                                            onChange={e => setNewTableConfig({ ...newTableConfig, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">ยกเลิก</button>
                                <button onClick={handleAddTable} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition">ยืนยัน</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableManager;