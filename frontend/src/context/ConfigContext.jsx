// src/context/ConfigContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);

    // ✅ ฟังก์ชันดึงข้อมูล (ไม่ต้องเช็ค Token!)
    const fetchConfig = async () => {
        try {
            // ไม่ต้องใส่ Header Authorization เพราะเราเปิด Public แล้ว
            const res = await fetch(`${API_BASE_URL}/settings`);
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
                console.log("✅ Config Loaded from DB:", data); // ดู Log นี้ใน Console
            } else {
                console.error("❌ Failed to fetch config");
            }
        } catch (error) {
            console.error("Error fetching config:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ useEffect ทำงานทันทีที่เปิดเว็บ (ไม่ต้องรอ Token)
    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, fetchConfig, loading }}>
            {children}
        </ConfigContext.Provider>
    );
};