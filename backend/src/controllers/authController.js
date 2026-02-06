const User = require('../models/userModels');
const jwt = require('jsonwebtoken');

const getRandomAvatar = () => {
    const randomNum = Math.floor(Math.random() * 6) + 1; // สุ่มเลข 1-6
    return `${randomNum}.png`;
};

// --- 1. Register (สมัครสมาชิก) ---
const register = async (req, res) => {
    try {
        const { username, email, password, name, phone } = req.body;

        // ... (Validation เหมือนเดิม) ...

        const newUser = new User({
            username,
            phone,
            email,
            name,
            password: password,
            role: 'user', // 🔒 Hardcode ไปเลย ปลอดภัย 100%
            avatar: getRandomAvatar()
        });

        await newUser.save();
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!' });

    } catch (error) {
        if (error.code === 11000) {
            // กรณีซ้ำที่ Email
            if (error.keyValue.email) {
                return res.status(400).json({
                    message: `ไม่สามารถสร้างบัญชีได้ เนื่องจากอีเมล ${error.keyValue.email} มีอยู่ในระบบแล้ว`
                });
            }

            // กรณีซ้ำที่ Username (ตามรูป Error ของคุณ)
            if (error.keyValue.username) {
                return res.status(400).json({
                    message: `ไม่สามารถสร้างบัญชีได้ เนื่องจากชื่อผู้ใช้ "${error.keyValue.username}" ถูกใช้งานแล้ว`
                });
            }
        }

        // Error อื่นๆ
        res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
    }
};

// --- 2. Login (เข้าสู่ระบบ) ---
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) return res.status(400).json({ message: 'Please provide credentials' });

        // หา User จาก username หรือ email
        const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // ❌ ลบส่วน bcrypt.compare ออก
        // const isMatch = await bcrypt.compare(password, user.password);

        // ✅ เช็ค Password แบบตรงๆ (Plain Text Comparison)
        // ถ้ารหัสที่กรอกมา ไม่ตรงกับ ในฐานข้อมูล
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // สร้าง Token (เหมือนเดิม)
        // ✅ ส่ง avatar กลับไปด้วยตอน Login (เผื่อ Frontend เอาไปใช้เลย)
        const payload = {
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                avatar: user.avatar // เพิ่มตรงนี้ด้วยก็ได้
            }
        };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ message: "Login successful!", token: token, user: payload.user });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
// --- 3. Get All Users (Admin Only) --- ✅ เพิ่มส่วนนี้
const getAllUsers = async (req, res) => {
    try {
        // ⚠️ ต้องไม่มี .select('-password') ถ้าอยากให้ส่ง password มา
        // และถ้า Database เก็บแบบ Hash มันจะส่ง Hash มา (อ่านไม่ออก)
        // ถ้าอยากให้อ่านออก Database ต้องเก็บแบบ Plain Text (ไม่ปลอดภัย)
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Create User (สำหรับ Admin สร้างในระบบหลังบ้าน) -> 🔓 เลือก Role ได้
const createUser = async (req, res) => {
    try {
        const { username, email, password, name, phone, role } = req.body;

        // ... (Validation เหมือนเดิม) ...

        // เช็คซ้ำ
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(409).json({ message: 'มีผู้ใช้นี้อยู่แล้ว' });

        const newUser = new User({
            username,
            phone,
            email,
            name,
            password: password,
            role: role || 'user', // 🔓 ให้ Admin เลือกได้
            avatar: getRandomAvatar()
        });

        await newUser.save();
        res.status(201).json({ message: 'สร้างผู้ใช้งานสำเร็จ', user: newUser });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 5. Update User (Admin Only) ---
const updateUser = async (req, res) => {
    try {
        const { name, role, password } = req.body;
        const updateData = { name, role };

        // ถ้ามีการส่ง password มาใหม่ ให้บันทึกทับเลย (Plain Text)
        if (password && password.trim() !== "") {
            // ❌ ลบส่วน Hash ทิ้งไป
            // const salt = await bcrypt.genSalt(10);
            // updateData.password = await bcrypt.hash(password, salt);

            // ✅ บันทึกตรงๆ
            updateData.password = password;
        }

        // ✅ ลบ .select('-password') ออกด้วย เพื่อให้ Response ส่งรหัสกลับมาให้ Frontend อัปเดตตารางทันที
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(updatedUser);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 6. Delete User (Admin Only) --- ✅ เพิ่มส่วนนี้
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getAllUsers, updateUser, deleteUser, createUser };