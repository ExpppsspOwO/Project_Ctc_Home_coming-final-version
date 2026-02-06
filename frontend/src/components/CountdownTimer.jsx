import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ expiresAt, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expireTime = new Date(expiresAt).getTime();
            const distance = expireTime - now;

            if (distance < 0) {
                setTimeLeft("หมดเวลา");
                setIsExpired(true);
                if (onExpire) onExpire();
                return;
            }

            // --- 🧮 คำนวณหน่วยเวลา ---
            const oneSecond = 1000;
            const oneMinute = oneSecond * 60;
            const oneHour = oneMinute * 60;
            const oneDay = oneHour * 24;
            const oneWeek = oneDay * 7;

            const weeks = Math.floor(distance / oneWeek);
            const days = Math.floor((distance % oneWeek) / oneDay);
            const hours = Math.floor((distance % oneDay) / oneHour);
            const minutes = Math.floor((distance % oneHour) / oneMinute);
            const seconds = Math.floor((distance % oneMinute) / oneSecond);

            // --- 🎨 จัดรูปแบบข้อความให้สวยงาม ---
            const fHours = String(hours).padStart(2, '0');
            const fMin = String(minutes).padStart(2, '0');
            const fSec = String(seconds).padStart(2, '0');

            let displayText = "";

            // 1. ถ้ามีสัปดาห์ ให้โชว์สัปดาห์
            if (weeks > 0) {
                displayText += `${weeks} สัปดาห์ `;
            }

            // 2. ถ้ามีวัน ให้โชว์วัน
            if (days > 0) {
                displayText += `${days} วัน `;
            }

            // 3. ถ้ามีสัปดาห์หรือวัน ให้เติมคำเชื่อม "กับอีก" ให้ดูเป็นธรรมชาติ
            if (weeks > 0 || days > 0) {
                displayText += `กับอีก `;
            }

            // 4. เวลา HH:MM:SS (นาที:วินาที)
            displayText += `${fHours}:${fMin}:${fSec}`;

            setTimeLeft(displayText);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    return (
        <div className={`flex items-center gap-2 font-mono text-sm md:text-base font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-colors duration-300
            ${isExpired 
                ? 'bg-red-100 text-red-600 border-red-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
            }`}>
            <Clock size={18} className={isExpired ? '' : 'animate-pulse shrink-0'} />
            <span className="whitespace-nowrap">
                {isExpired ? 'หมดเวลาชำระเงิน' : `เหลือเวลา ${timeLeft}`}
            </span>
        </div>
    );
};

export default CountdownTimer;