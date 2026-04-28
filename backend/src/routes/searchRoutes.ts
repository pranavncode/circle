import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// Search users by username (partial match)
router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const currentUsername = String(req.query.username || '').trim();

  if (!q) {
    res.status(400).json({ error: 'Search query is required' });
    return;
  }

  try {
    const whereClause: any = {
      username: { contains: q },
    };

    if (currentUsername) {
      whereClause.NOT = { username: currentUsername };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        about: true,
        skills: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { username: 'asc' },
    });

    // If current user is provided, check follow status for each result
    if (currentUsername && users.length > 0) {
      const currentUser = await prisma.user.findUnique({
        where: { username: currentUsername },
        select: { id: true },
      });

      if (currentUser) {
        const follows = await prisma.follow.findMany({
          where: {
            followerId: currentUser.id,
            followingId: { in: users.map((u) => u.id) },
          },
          select: { followingId: true },
        });

        const followingIds = new Set(follows.map((f) => f.followingId));
        const usersWithFollowStatus = users.map((u) => ({
          ...u,
          isFollowing: followingIds.has(u.id),
        }));

        res.json(usersWithFollowStatus);
        return;
      }
    }

    const usersWithFollowStatus = users.map((u) => ({
      ...u,
      isFollowing: false,
    }));

    res.json(usersWithFollowStatus);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
