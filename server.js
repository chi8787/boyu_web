require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// 引入 Models
const User = require('./models/User');
const Post = require('./models/Post');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 設定靜態檔案目錄 (前端放在 public)

// 連接 MongoDB (請確保你有本地 MongoDB 或 MongoDB Atlas)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/boyu_homestay')
    .then(() => console.log('✅ MongoDB 連線成功'))
    .catch(err => console.error('❌ MongoDB 連線失敗:', err));

// === API 路由 ===

// 1. 註冊
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, username: email.split('@')[0] });
        res.json({ message: '註冊成功', user });
    } catch (error) {
        res.status(400).json({ error: '註冊失敗，Email 可能已被使用' });
    }
});

// 2. 登入
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: '登入成功', token, username: user.username });
});

// 3. 取得所有文章
app.get('/api/posts', async (req, res) => {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
});

// 4. 新增文章 (需要登入)
app.post('/api/posts', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '未登入' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { content } = req.body;
        const newPost = await Post.create({
            username: decoded.username,
            content,
            rating: 5
        });
        res.json(newPost);
    } catch (error) {
        res.status(403).json({ error: 'Token 無效' });
    }
});

// 5. 取得已預訂日期
app.get('/api/bookings', async (req, res) => {
    const bookings = await Booking.find();
    // 回傳格式如: ["2024-05-20", "2024-05-21"]
    res.json(bookings.map(b => b.date));
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 伺服器運行中: http://localhost:${PORT}`);
});