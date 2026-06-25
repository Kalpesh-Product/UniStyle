import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import Product from '../models/Product.js';
import { parseProductsFromCsv, slugify } from '../lib/sheetImport.js';
import { requireImportKey } from '../middleware/importAuth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const colorSchema = z.object({ name: z.string().min(1), hex: z.string().min(1) });

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(), // cents
  compareAt: z.number().int().nonnegative().optional(),
  category: z.string().min(1),
  university: z.string().optional(),
  gender: z.enum(['men', 'women', 'unisex']).optional(),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(colorSchema).default([]),
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  badge: z.string().optional(),
});

const updateProductSchema = productSchema.partial();

async function uniqueSlug(name, excludeId) {
  const base = slugify(name);
  let slug = base;
  let i = 1;
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${++i}`;
  }
  return slug;
}

// POST /api/products/import-sheet
// Postman: Body -> form-data -> key "file" (type File) -> pick the CSV.
// Header: x-import-key: <IMPORT_API_KEY from .env>
// Query: ?write=true to actually commit. Without it, this only previews
// what would be imported (matches the CLI script's safe-by-default behavior).
router.post('/import-sheet', requireImportKey, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use form-data with key "file".' });
    }

    const text = req.file.buffer.toString('utf8');
    const { products, warnings, totalRows } = parseProductsFromCsv(text);
    const write = req.query.write === 'true';

    if (!write) {
      return res.json({
        dryRun: true,
        totalRows,
        validProducts: products.length,
        skipped: totalRows - products.length,
        warnings,
        products,
      });
    }

    let imported = 0;
    for (const product of products) {
      await Product.findOneAndUpdate(
        { slug: product.slug },
        product,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      imported++;
    }

    res.json({
      dryRun: false,
      totalRows,
      validProducts: products.length,
      skipped: totalRows - products.length,
      imported,
      warnings,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products?category=&university=&gender=&search=&featured=true&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { category, university, gender, search, featured, page = 1, limit = 20 } = req.query;

    const where = {
      ...(category ? { category: String(category) } : {}),
      ...(university ? { university: String(university) } : {}),
      ...(gender ? { gender: String(gender) } : {}),
      ...(featured ? { featured: featured === 'true' } : {}),
      ...(search
        ? {
            $or: [
              { name: { $regex: String(search), $options: 'i' } },
              { description: { $regex: String(search), $options: 'i' } },
            ],
          }
        : {}),
    };

    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [products, total] = await Promise.all([
      Product.find(where).sort({ createdAt: -1 }).skip(skip).limit(take),
      Product.countDocuments(where),
    ]);

    res.json({ products, total, page: Number(page), limit: take });
  } catch (err) {
    next(err);
  }
});

// POST /api/products (admin only)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const slug = await uniqueSlug(data.name);
    const product = await Product.create({ ...data, slug });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id (admin only)
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (data.name && data.name !== product.name) {
      data.slug = await uniqueSlug(data.name, product._id);
    }

    Object.assign(product, data);
    await product.save();
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

export default router;
