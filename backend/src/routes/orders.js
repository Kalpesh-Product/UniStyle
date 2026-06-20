import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/orders  - order history for the logged-in user
router.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

export default router;
