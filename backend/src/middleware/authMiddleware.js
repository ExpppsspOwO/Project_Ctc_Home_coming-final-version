const jwt = require('jsonwebtoken');

// --- ด่านที่ 1: เช็ค Token ---
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = decoded.user; // แนบข้อมูล user (ที่มี role) เข้าไป
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// --- ด่านที่ 2: เช็ค Role (String Comparison) ---
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        // ✅ เช็คตรงๆ ว่า role ของ user (เช่น 'customer')
        // อยู่ใน list ที่อนุญาตไหม (เช่น ['admin', 'officer'])
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access denied. Requires ${allowedRoles.join(' or ')} role.` });
        }
        next();
    };
};

module.exports = { protect, checkRole };