import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import prisma from '../prismaClient';

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  const username = String(req.query.username || '');
  if (!username) {
    return res.status(400).json({ error: 'username query parameter is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } },
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  const { username, title, caption } = req.body;
  if (!username || !title || !caption) {
    return res.status(400).json({ error: 'username, title, and caption are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const imageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : undefined;
    const post = await prisma.post.create({
      data: {
        title,
        caption,
        imageUrl,
        userId: user.id,
      },
      include: { user: { select: { username: true } } },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const postId = Number(req.params.id);
  const { username, title, caption } = req.body;

  if (!username || !title || !caption) {
    return res.status(400).json({ error: 'username, title, and caption are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingPost = await prisma.post.findFirst({
      where: { id: postId, userId: user.id },
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found or not owned by user' });
    }

    const imageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : existingPost.imageUrl;
    if (req.file && existingPost.imageUrl) {
      const oldFilename = existingPost.imageUrl.split('/').pop();
      const oldPath = path.join(uploadDir, oldFilename || '');
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        caption,
        imageUrl,
      },
      include: { user: { select: { username: true } } },
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const postId = Number(req.params.id);
  const username = String(req.query.username || '');

  if (!username) {
    return res.status(400).json({ error: 'username query parameter is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingPost = await prisma.post.findFirst({
      where: { id: postId, userId: user.id },
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found or not owned by user' });
    }

    if (existingPost.imageUrl) {
      const oldPath = path.join(__dirname, '../', existingPost.imageUrl.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
