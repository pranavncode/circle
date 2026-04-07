import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
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

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/username and password are required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: identifier }, { email: identifier }] },
    });

    if (!user) {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (identifier === adminUsername && password === adminPassword) {
        const hashedPassword = await bcrypt.hash(adminPassword || 'admin', 10);
        const adminUser = await prisma.user.upsert({
          where: { username: adminUsername! },
          update: {
            email: 'admin@circle.local',
            password: hashedPassword,
          },
          create: {
            username: adminUsername!,
            email: 'admin@circle.local',
            password: hashedPassword,
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
        return res.json(adminUser);
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      about: user.about,
      skills: user.skills,
      interests: user.interests,
      experience: user.experience,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
