import express from 'express';
import prisma from '../prismaClient';
import { getIo, getUserSocketId } from '../socket';

const router = express.Router();

// Get all notifications for a user
router.get('/', async (req, res) => {
  const username = String(req.query.username || '').trim();

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

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        actor: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
  const username = String(req.query.username || '').trim();

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

    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
  const notificationId = Number(req.params.id);

  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    const io = getIo();
    const user = await prisma.user.findUnique({ where: { id: notification.userId }, select: { username: true } });
    if (user) {
      const socketId = getUserSocketId(user.username);
      if (socketId) {
        io.to(socketId).emit('notifications_read');
      }
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read for a user
router.put('/read-all', async (req, res) => {
  const username = String(req.query.username || req.body.username || '').trim();

  if (!username) {
    return res.status(400).json({ error: 'username is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    const io = getIo();
    const socketId = getUserSocketId(username);
    if (socketId) io.to(socketId).emit('notifications_read');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
