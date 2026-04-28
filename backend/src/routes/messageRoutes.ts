import express from 'express';
import prisma from '../prismaClient';
import { getIo, getUserSocketId } from '../socket';

const router = express.Router();

// Get conversation list for a user
router.get('/conversations', async (req, res) => {
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

    // Get all messages involving this user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { id: true, username: true, about: true } },
        receiver: { select: { id: true, username: true, about: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationMap = new Map<number, {
      otherUser: { id: number; username: string; about: string | null };
      lastMessage: typeof messages[0];
    }>();

    for (const msg of messages) {
      const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          otherUser,
          lastMessage: msg,
        });
      }
    }

    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages between two users
router.get('/:otherUsername', async (req, res) => {
  const username = String(req.query.username || '').trim();
  const otherUsername = String(req.params.otherUsername || '').trim();

  if (!username || !otherUsername) {
    return res.status(400).json({ error: 'Both usernames are required' });
  }

  try {
    const [user, otherUser] = await Promise.all([
      prisma.user.findUnique({ where: { username }, select: { id: true } }),
      prisma.user.findUnique({ where: { username: otherUsername }, select: { id: true, username: true, about: true } }),
    ]);

    if (!user || !otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUser.id },
          { senderId: otherUser.id, receiverId: user.id },
        ],
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ messages, otherUser });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read from a specific user
router.put('/:otherUsername/read', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const otherUsername = String(req.params.otherUsername || '').trim();

  if (!username || !otherUsername) {
    return res.status(400).json({ error: 'Both usernames are required' });
  }

  try {
    const [user, otherUser] = await Promise.all([
      prisma.user.findUnique({ where: { username }, select: { id: true } }),
      prisma.user.findUnique({ where: { username: otherUsername }, select: { id: true } }),
    ]);

    if (!user || !otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.message.updateMany({
      where: {
        senderId: otherUser.id,
        receiverId: user.id,
        read: false,
      },
      data: { read: true },
    });

    const io = getIo();
    const senderSocketId = getUserSocketId(otherUsername);
    const receiverSocketId = getUserSocketId(username);

    if (senderSocketId) {
      io.to(senderSocketId).emit('messages_read', { byUser: username });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messages_read', { withUser: otherUsername });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/', async (req, res) => {
  const { senderUsername, receiverUsername, content } = req.body;

  if (!senderUsername || !receiverUsername || !content?.trim()) {
    return res.status(400).json({ error: 'senderUsername, receiverUsername, and content are required' });
  }

  if (senderUsername === receiverUsername) {
    return res.status(400).json({ error: 'Cannot send message to yourself' });
  }

  try {
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { username: senderUsername }, select: { id: true } }),
      prisma.user.findUnique({ where: { username: receiverUsername }, select: { id: true } }),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: sender.id,
        receiverId: receiver.id,
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        type: 'message',
        content: `${senderUsername} sent you a message`,
        userId: receiver.id,
        actorId: sender.id,
      },
    });

    const io = getIo();
    const receiverSocketId = getUserSocketId(receiverUsername);
    const senderSocketId = getUserSocketId(senderUsername);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', message);
      io.to(receiverSocketId).emit('new_notification');
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
