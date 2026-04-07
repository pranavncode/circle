"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    const username = String(req.query.username || '');
    if (!username) {
        return res.status(400).json({ error: 'username query parameter is required' });
    }
    try {
        const user = await prismaClient_1.default.user.findUnique({
            where: { username },
            select: { id: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const posts = await prismaClient_1.default.post.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/', async (req, res) => {
    const { username, title, caption } = req.body;
    if (!username || !title || !caption) {
        return res.status(400).json({ error: 'username, title, and caption are required' });
    }
    try {
        const user = await prismaClient_1.default.user.findUnique({
            where: { username },
            select: { id: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const post = await prismaClient_1.default.post.create({
            data: {
                title,
                caption,
                userId: user.id,
            },
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
