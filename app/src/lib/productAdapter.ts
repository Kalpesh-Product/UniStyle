import type { BackendProduct } from '@/lib/api';
import type { Product } from '@/data/products';

export function adaptProduct(p: BackendProduct): Product {
  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.compareAt ? p.compareAt / 100 : p.price / 100,
    salePrice: p.compareAt ? p.price / 100 : undefined,
    description: p.description,
    images: p.images,
    category: p.category,
    university: p.university,
    gender: p.gender,
    colors: p.colors,
    sizes: p.sizes.length ? p.sizes : undefined,
    inStock: p.stock > 0,
    rating: p.rating,
    reviewCount: p.reviewCount,
    badge: p.badge,
    countdownEnd: p.countdownEnd,
  };
}
