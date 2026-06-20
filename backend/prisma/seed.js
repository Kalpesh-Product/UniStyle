import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mirrors src/data/products.ts from the frontend so the DB matches what's already on the site.
// Prices are converted from dollars to cents for storage.
const products = [
  {
    slug: 'simona-glossed-leather-shoulder-bag',
    name: 'Simona Glossed-Leather Shoulder Bag',
    description: 'A sleek cylindrical silhouette crafted from high-shine glossed leather. Features a thin adjustable strap and minimalist hardware for everyday sophistication.',
    price: 7200,
    category: 'Bags',
    images: ['/product-bag-black.jpg'],
    colors: ['Pink', 'Black', 'Brown', 'Green'],
    sizes: [],
    stock: 25,
    featured: false,
  },
  {
    slug: 'fringed-wool-blend-turtleneck-top',
    name: 'Fringed Wool-Blend Turtleneck Top',
    description: 'A cozy statement piece in a premium wool blend. The chunky cable-knit pattern and dramatic fringe hem bring texture and movement to cold-weather dressing.',
    price: 6000,
    compareAt: 7500,
    category: 'Women',
    images: ['/product-turtleneck.jpg'],
    colors: ['Cream', 'Charcoal'],
    sizes: ['S', 'M', 'L'],
    stock: 30,
    featured: true,
  },
  {
    slug: 'triomphe-cat-eye-acetate-sunglasses',
    name: 'Triomphe Cat-Eye Acetate Sunglasses',
    description: 'Bold angular frames in glossy acetate with signature gold-tone temple detailing. UV400 protection with a distinctive cat-eye silhouette.',
    price: 6000,
    category: 'Glases',
    images: ['/product-sunglasses.jpg'],
    colors: ['Black', 'Tortoise'],
    sizes: [],
    stock: 40,
    featured: false,
  },
  {
    slug: 'althea-belted-cow-hair-trench-coat',
    name: 'Althea Belted Cow Hair Trench Coat',
    description: 'A luxurious take on the classic trench in distinctive cow hair. Double-breasted silhouette with storm flaps, belted waist, and rich burgundy patina.',
    price: 8000,
    compareAt: 15000,
    category: 'Women',
    images: ['/product-trench.jpg'],
    colors: ['Burgundy'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15,
    featured: true,
  },
  {
    slug: 'wool-coat',
    name: 'Wool Coat',
    description: 'A refined wool coat with clean tailoring, designed as a versatile layer for cold-weather dressing.',
    price: 8000,
    compareAt: 11000,
    category: 'Women',
    images: ['/product-wool-coat.jpg'],
    colors: ['Navy', 'Purple', 'Yellow'],
    sizes: ['M', 'L', 'XL'],
    stock: 20,
    featured: true,
  },
  {
    slug: 'luxury-touch-polo',
    name: 'Luxury-Touch Polo',
    description: 'Elevated polo in premium pique cotton with contrast tipping at the collar and cuffs. A refined essential for smart-casual dressing.',
    price: 5000,
    category: 'Men',
    images: ['/product-polo.jpg'],
    colors: ['Navy', 'White'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: 35,
    featured: false,
  },
  {
    slug: 'jacquard-chore-coat',
    name: 'Jacquard Chore Coat',
    description: 'A modern workwear staple in textured jacquard. Boxy silhouette with patch pockets and horn buttons for a heritage-inspired look.',
    price: 7000,
    category: 'Men',
    images: ['/product-chore-coat.jpg'],
    colors: ['Navy'],
    sizes: ['M', 'L', 'XL'],
    stock: 18,
    featured: false,
  },
  {
    slug: 'heritage-cotton-slub-henley-t-shirt',
    name: 'Heritage Cotton Slub Henley T-Shirt',
    description: 'A timeless layer in slub cotton with a three-button henley placket. The uneven texture gives each piece a unique, lived-in character.',
    price: 12000,
    compareAt: 15000,
    category: 'Men',
    images: ['/product-henley.jpg'],
    colors: ['Indigo', 'Olive'],
    sizes: ['M', 'L', 'XL'],
    stock: 22,
    featured: false,
  },
  {
    slug: 'le-teckel-medium-nubuck-shoulder-bag',
    name: 'Le Teckel Medium Nubuck Shoulder Bag',
    description: 'An elongated silhouette in soft nubuck suede. The clean lines and structured base make this a versatile everyday companion.',
    price: 6000,
    compareAt: 9600,
    category: 'Bags',
    images: ['/product-red-bag.jpg'],
    colors: ['Red', 'Black', 'Tan'],
    sizes: [],
    stock: 12,
    featured: true,
  },
  {
    slug: 'apolline-patent-leather-slingback-pumps',
    name: 'Apolline Patent-Leather Slingback Pumps',
    description: 'Sculpted slingback pumps in glossy patent leather. The pointed toe and slender heel create an elongating silhouette.',
    price: 8500,
    category: 'Shoes',
    images: ['/product-shoes.jpg'],
    colors: ['Nude', 'Black'],
    sizes: ['36', '37', '38', '39', '40'],
    stock: 28,
    featured: false,
  },
  {
    slug: 'ivy-aviator-style-gold-tone-sunglasses',
    name: 'Ivy Aviator-Style Gold-Tone Sunglasses',
    description: 'Modern aviator frames with gold-tone metal and gradient lenses. A timeless shape reimagined with contemporary proportions.',
    price: 5500,
    category: 'Glases',
    images: ['/product-sunglasses.jpg'],
    colors: ['Gold', 'Silver'],
    sizes: [],
    stock: 33,
    featured: false,
  },
  {
    slug: 'bow-tie-105-cutout-leather-pumps',
    name: 'Bow Tie 105 Cutout Leather Pumps',
    description: 'Statement pumps with architectural cutout detailing. Crafted from smooth leather with a sculptural 105mm heel.',
    price: 6500,
    category: 'Shoes',
    images: ['/product-shoes.jpg'],
    colors: ['Black'],
    sizes: ['37', '38', '39', '40'],
    stock: 0,
    featured: false,
  },
];

async function main() {
  console.log('Seeding products...');
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      create: product,
      update: product,
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
