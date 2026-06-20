import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/products?category=&search=&featured=true&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { category, search, featured, page = 1, limit = 20 } = req.query;

    const where = {
      ...(category ? { category: String(category) } : {}),
      ...(featured ? { featured: featured === 'true' } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { description: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: Number(page), limit: take });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

export default router;
