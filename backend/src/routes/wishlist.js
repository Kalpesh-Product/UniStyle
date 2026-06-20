import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const addSchema = z.object({ productId: z.string().uuid() });

// GET /api/wishlist
router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist
router.post('/', async (req, res, next) => {
  try {
    const data = addSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId: data.productId } },
      create: { userId: req.user.id, productId: data.productId },
      update: {},
      include: { product: true },
    });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', async (req, res, next) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
