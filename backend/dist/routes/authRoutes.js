"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const router = express_1.default.Router();
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const existingUser = await prismaClient_1.default.user.findFirst({
            where: { OR: [{ username }, { email }] },
        });
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prismaClient_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
            select: { id: true, username: true, email: true, createdAt: true },
        });
        res.status(201).json(user);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: 'Email/username and password are required' });
    }
    try {
        const user = await prismaClient_1.default.user.findFirst({
            where: { OR: [{ username: identifier }, { email: identifier }] },
        });
        if (!user) {
            const adminUsername = process.env.ADMIN_USERNAME;
            const adminPassword = process.env.ADMIN_PASSWORD;
            if (identifier === adminUsername && password === adminPassword) {
                return res.json({
                    id: 'admin',
                    username: adminUsername,
                    email: 'admin@circle.local',
                    createdAt: new Date().toISOString(),
                });
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
