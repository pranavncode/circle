import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

router.get('/:username', async (req, res) => {
  const username = String(req.params.username || '');
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        about: true,
        skills: true,
        interests: true,
        experience: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:username', async (req, res) => {
  const username = String(req.params.username || '');
  const { newUsername, about, skills, interests, experience } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (newUsername && newUsername !== username) {
      const usernameTaken = await prisma.user.findUnique({ where: { username: newUsername } });
      if (usernameTaken) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { username },
      data: {
        username: newUsername ?? username,
        about,
        skills,
        interests,
        experience,
      },
      select: {
        id: true,
        username: true,
        email: true,
        about: true,
        skills: true,
        interests: true,
        experience: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
