import express from 'express';
import prisma from '../prismaClient';
import { getIo, getUserSocketId } from '../socket';

const router = express.Router();

// Follow a user
router.post('/', async (req, res) => {
  const { followerUsername, followingUsername } = req.body;

  if (!followerUsername || !followingUsername) {
    return res.status(400).json({ error: 'Both followerUsername and followingUsername are required' });
  }

  if (followerUsername === followingUsername) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  try {
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { username: followerUsername }, select: { id: true } }),
      prisma.user.findUnique({ where: { username: followingUsername }, select: { id: true } }),
    ]);

    if (!follower || !following) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Already following this user' });
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: follower.id,
        followingId: following.id,
      },
    });

    // Create notification for the followed user
    await prisma.notification.create({
      data: {
        type: 'follow',
        content: `${followerUsername} started following you`,
        userId: following.id,
        actorId: follower.id,
      },
    });

    const io = getIo();
    const receiverSocketId = getUserSocketId(followingUsername);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_notification');
    }

    res.status(201).json({ success: true, follow });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Unfollow a user
router.delete('/', async (req, res) => {
  const { followerUsername, followingUsername } = req.body;

  if (!followerUsername || !followingUsername) {
    return res.status(400).json({ error: 'Both followerUsername and followingUsername are required' });
  }

  try {
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { username: followerUsername }, select: { id: true } }),
      prisma.user.findUnique({ where: { username: followingUsername }, select: { id: true } }),
    ]);

    if (!follower || !following) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: follower.id,
        followingId: following.id,
      },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get followers of a user
router.get('/followers/:username', async (req, res) => {
  const username = String(req.params.username || '');

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: { id: true, username: true, about: true, skills: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(followers.map((f) => f.follower));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get users that a user is following
router.get('/following/:username', async (req, res) => {
  const username = String(req.params.username || '');

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: { id: true, username: true, about: true, skills: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(following.map((f) => f.following));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get follower/following counts
router.get('/counts/:username', async (req, res) => {
  const username = String(req.params.username || '');

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
    ]);

    res.json({ followers: followersCount, following: followingCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Check follow status
router.get('/status', async (req, res) => {
  const followerUsername = String(req.query.follower || '');
  const followingUsername = String(req.query.following || '');

  if (!followerUsername || !followingUsername) {
    return res.status(400).json({ error: 'Both follower and following query params are required' });
  }

  try {
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { username: followerUsername }, select: { id: true } }),
      prisma.user.findUnique({ where: { username: followingUsername }, select: { id: true } }),
    ]);

    if (!follower || !following) {
      return res.json({ isFollowing: false });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id,
        },
      },
    });

    res.json({ isFollowing: !!existing });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
