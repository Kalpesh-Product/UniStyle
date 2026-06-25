import { Router } from 'express';
import { z } from 'zod';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const reviewSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

async function recomputeProductRating(productId) {
  const reviews = await Review.find({ productId });
  const reviewCount = reviews.length;
  const rating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : undefined;
  await Product.findByIdAndUpdate(productId, { reviewCount, ...(rating !== undefined ? { rating } : {}) });
}

// GET /api/reviews/me — my written reviews + delivered items still awaiting a review
router.get('/me', async (req, res, next) => {
  try {
    const [reviews, deliveredOrders] = await Promise.all([
      Review.find({ userId: req.user.id }).populate('productId').sort({ createdAt: -1 }),
      Order.find({ userId: req.user.id, status: 'DELIVERED' }).populate('items.productId'),
    ]);

    const reviewedKeys = new Set(reviews.map(r => `${r.orderId}:${r.productId?._id}`));

    const awaiting = [];
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        if (!item.productId) continue;
        const key = `${order._id}:${item.productId._id}`;
        if (!reviewedKeys.has(key)) {
          awaiting.push({
            orderId: order._id,
            deliveredAt: order.updatedAt,
            product: item.productId,
          });
        }
      }
    }

    res.json({ reviews, awaiting });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews
router.post('/', async (req, res, next) => {
  try {
    const data = reviewSchema.parse(req.body);

    const order = await Order.findById(data.orderId);
    if (!order || order.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ error: 'You can only review delivered orders' });
    }
    if (!order.items.some(item => item.productId.toString() === data.productId)) {
      return res.status(400).json({ error: 'Product was not part of this order' });
    }

    const existing = await Review.findOne({ userId: req.user.id, productId: data.productId, orderId: data.orderId });
    if (existing) {
      return res.status(409).json({ error: 'You already reviewed this product for this order' });
    }

    const review = await Review.create({ ...data, userId: req.user.id });
    await recomputeProductRating(data.productId);

    const populated = await review.populate('productId');
    res.status(201).json({ review: populated });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reviews/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const data = reviewSchema.pick({ rating: true, comment: true }).partial().parse(req.body);
    const review = await Review.findById(req.params.id);
    if (!review || review.userId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Review not found' });
    }

    Object.assign(review, data);
    await review.save();
    await recomputeProductRating(review.productId);

    const populated = await review.populate('productId');
    res.json({ review: populated });
  } catch (err) {
    next(err);
  }
});

export default router;
