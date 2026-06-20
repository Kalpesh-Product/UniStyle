import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // every cart route requires a logged-in user

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

// GET /api/cart
router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart  - add an item (or increment if same product/size/color exists)
router.post('/', async (req, res, next) => {
  try {
    const data = addItemSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size_color: {
          userId: req.user.id,
          productId: data.productId,
          size: data.size ?? null,
          color: data.color ?? null,
        },
      },
    });

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + data.quantity },
          include: { product: true },
        })
      : await prisma.cartItem.create({
          data: { userId: req.user.id, ...data },
          include: { product: true },
        });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cart/:itemId  - update quantity
router.patch('/:itemId', async (req, res, next) => {
  try {
    const data = updateItemSchema.parse(req.body);

    const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: req.params.itemId },
      data: { quantity: data.quantity },
      include: { product: true },
    });

    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:itemId
router.delete('/:itemId', async (req, res, next) => {
  try {
    const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart  - clear entire cart
router.delete('/', async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
