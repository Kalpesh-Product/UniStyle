import { Router } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const addressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  phone: z.string().optional(),
});

const checkoutSchema = z.object({
  shippingAddress: addressSchema,
});

// POST /api/checkout/create-session
// Reads the user's current cart, creates a pending Order, and returns a Stripe Checkout URL.
router.post('/create-session', requireAuth, async (req, res, next) => {
  try {
    const data = checkoutSchema.parse(req.body);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Create a PENDING order first so we have a record even if the user abandons checkout
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        shippingAddress: data.shippingAddress,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.product.price,
          })),
        },
      },
    });

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: item.product.images?.slice(0, 1) ?? [],
          metadata: { size: item.size ?? '', color: item.color ?? '' },
        },
        unit_amount: item.product.price, // cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      customer_email: req.user.email,
      success_url: `${process.env.CLIENT_URL}/account?order=success&orderId=${order.id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
      metadata: { orderId: order.id, userId: req.user.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.json({ url: session.url, orderId: order.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/checkout/webhook
// Stripe calls this directly. Must use the raw body (configured in server.js).
// This is what actually marks an order PAID and clears the cart — never trust the client for this.
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { orderId, userId } = session.metadata;

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });
      // Clear the user's cart now that the order is confirmed paid
      await prisma.cartItem.deleteMany({ where: { userId } });
    } catch (err) {
      console.error('Failed to finalize order after payment:', err);
    }
  }

  res.json({ received: true });
});

export default router;
