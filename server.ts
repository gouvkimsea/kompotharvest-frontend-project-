import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { PRODUCTS, BUNDLES, RECIPES, CUSTOMER_REVIEWS } from './src/data/botenzData.ts';
import { calculateCartSummary, CartItem } from './src/utils/storeLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface OrderRecord {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  summary: any;
  status: 'confirmed' | 'processing' | 'shipped';
}

const orders: OrderRecord[] = [];
const subscribers: Array<{ email: string; subscribedAt: string }> = [];
const feedbacks: Array<{ name: string; email: string; rating: number; message: string; date: string }> = [];

let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('[Gemini] Failed to initialize Gemini API client:', err);
  }
}

// ----------------- API Endpoints -----------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Kampot Harvest Co. Full-Stack API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    geminiEnabled: Boolean(genAI),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Products endpoint
app.get('/api/products', (req: Request, res: Response) => {
  const { flavor, category, search } = req.query;
  let list = [...PRODUCTS];

  if (category) {
    list = list.filter((p) => p.category === category);
  }
  if (flavor) {
    list = list.filter((p) => p.flavor.toLowerCase() === String(flavor).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.flavor.toLowerCase().includes(q)
    );
  }

  res.json({
    count: list.length,
    products: list,
  });
});

// Product detail endpoint
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Bundles endpoint
app.get('/api/bundles', (req: Request, res: Response) => {
  res.json({
    count: BUNDLES.length,
    bundles: BUNDLES,
  });
});

// Recipes endpoint
app.get('/api/recipes', (req: Request, res: Response) => {
  const { filter, search } = req.query;
  let list = [...RECIPES];

  if (filter && filter !== 'all') {
    list = list.filter((r) => r.productFilter === filter);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((r) => r.title.toLowerCase().includes(q));
  }

  res.json({
    count: list.length,
    recipes: list,
  });
});

// Reviews endpoint
app.get('/api/reviews', (req: Request, res: Response) => {
  res.json({
    count: CUSTOMER_REVIEWS.length,
    reviews: CUSTOMER_REVIEWS,
  });
});

// Cart validation & calculation endpoint
app.post('/api/cart/validate', (req: Request, res: Response) => {
  const { items, promoCode } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array' });
  }

  const isPromoValid =
    typeof promoCode === 'string' &&
    ['KAMPOT10', 'WELCOME10', 'HARVEST15'].includes(promoCode.trim().toUpperCase());

  const summary = calculateCartSummary(items, isPromoValid);
  res.json({
    valid: true,
    promoApplied: isPromoValid,
    summary,
  });
});

// Orders placement endpoint
app.post('/api/orders', (req: Request, res: Response) => {
  const { items, customer, promoCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }
  if (!customer?.email || !customer?.name) {
    return res.status(400).json({ error: 'Customer name and email are required' });
  }

  const isPromoValid =
    typeof promoCode === 'string' &&
    ['KAMPOT10', 'WELCOME10', 'HARVEST15'].includes(promoCode.trim().toUpperCase());

  const summary = calculateCartSummary(items, isPromoValid);

  const orderId = `KH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder: OrderRecord = {
    orderId,
    createdAt: new Date().toISOString(),
    items,
    customer,
    summary,
    status: 'confirmed',
  };

  orders.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order: newOrder,
  });
});

// Newsletter subscription endpoint
app.post('/api/newsletter', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const existing = subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    subscribers.push({ email, subscribedAt: new Date().toISOString() });
  }

  res.json({
    success: true,
    message: 'Welcome to the Kampot Harvest VIP Club! Enjoy 15% off your first order.',
    discountCode: 'HARVEST15',
  });
});

// Feedback submission endpoint
app.post('/api/feedback', (req: Request, res: Response) => {
  const { name, email, rating, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  const entry = {
    name,
    email: email || '',
    rating: Number(rating) || 5,
    message,
    date: new Date().toISOString(),
  };

  feedbacks.unshift(entry);

  res.json({
    success: true,
    message: 'Thank you for your valuable feedback!',
    feedback: entry,
  });
});

// AI Culinary Advisor (Gemini) endpoint
app.post('/api/ai/recommend', async (req: Request, res: Response) => {
  const { prompt, occasion, flavorPreference } = req.body;
  const userQuery = prompt || `I am looking for cashews for ${occasion || 'a gathering'}, preference: ${flavorPreference || 'savory & sweet'}`;

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are the master culinary sommelier and artisan guide for Kampot Harvest Co., Cambodia's premier artisan cashew and gourmet harvest producer.
Our signature offerings:
1. Artisan Roasted Cashews - Honey Butter (Rich Cambodian wild honey, churned grass-fed butter, delicate sweetness, slow-roasted to golden crunch in 100g pouch or 250g glass jar).
2. Artisan Roasted Cashews - Chili Lime (Authentic Kampot spicy red bird's eye chili, zesty sun-ripened kaffir lime, savory crunch, in 100g pouch or 250g glass jar).
3. The Tasting Duo and Complete 4-Pack Bundles.

Respond to this customer inquiry with warm, gourmet, enticing advice and recommended pairing:
"${userQuery}"`,
              },
            ],
          },
        ],
      });

      return res.json({
        success: true,
        recommendation: response.text,
        source: 'gemini-ai',
      });
    } catch (err: any) {
      console.warn('[Gemini Error]', err?.message || err);
    }
  }

  const isChiliLime =
    (userQuery && /chili|spicy|savory|beer|cocktail|lime|heat/i.test(userQuery)) ||
    flavorPreference === 'chili-lime';

  if (isChiliLime) {
    return res.json({
      success: true,
      recommendation:
        "For a bold, tantalizing experience, our Artisan Roasted Cashews in Chili Lime are unmatched! Hand-tossed with sun-dried Kampot bird's eye chilies, aromatic kaffir lime leaves, and fine ocean sea salt, they pair wonderfully with chilled craft beers, citrus cocktails, and fresh tropical salads.",
      suggestedProduct: 'product-chili-lime-jar-250g',
      suggestedRecipe: 'spicy-cashew-larb-bowl',
      source: 'curated-sommelier',
    });
  }

  return res.json({
    success: true,
    recommendation:
      "For a rich, velvety indulgence, we highly recommend our Honey Butter Roasted Cashews. Glazed with wild Cambodian floral honey and creamy churned butter, they deliver a satisfying crunch that elevates afternoon coffee, artisanal cheese boards, or warm oatmeal.",
    suggestedProduct: 'product-honey-butter-jar-250g',
    suggestedRecipe: 'pistachio-kunafa-toast',
    source: 'curated-sommelier',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          res.status(200).send('Kampot Harvest Backend Running.');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌿 [Kampot Harvest Fullstack Server]`);
    console.log(`🚀 Server running on:     http://0.0.0.0:${PORT}`);
    console.log(`📡 Health Check:          http://localhost:${PORT}/api/health`);
    console.log(`📦 Products Endpoint:      http://localhost:${PORT}/api/products`);
    console.log(`🤖 Gemini AI Sommelier:    ${genAI ? 'Enabled' : 'Curated Fallback'}\n`);
  });
}

startServer();

export default app;
