import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { PRODUCTS, BUNDLES, RECIPES, CUSTOMER_REVIEWS } from './src/data/botenzData.ts';
import {
  calculateCartSummary,
  CartItem,
  lookupOrderStatus,
  TrackedOrder,
  UserAccount,
  AccountRegistrationInput,
  createUserAccount,
  verifyUserAccount,
  getRolePermissions,
  isAdminAccount,
  migrateAccountRecord,
  InventoryItem,
  StockMovementRecord,
  createInitialInventory,
  calculateInventoryStats,
  applyInventoryOrderDeduction,
  adjustInventoryStock,
} from './src/utils/storeLogic.ts';

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

interface StoredUserRecord {
  account: UserAccount;
  passwordSalt: string;
  passwordHash: string;
}

function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { salt: actualSalt, hash: derivedKey };
}

function verifyPasswordHash(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

const seedUserPassword = hashPassword('Password123');
const seedAdminPassword = hashPassword(process.env.ADMIN_PASSWORD || 'AdminHarvest2026');
const seedAdminEmail = (process.env.ADMIN_EMAIL || 'admin@kampotharvest.com').trim().toLowerCase();

const storedAccounts: StoredUserRecord[] = [
  {
    account: {
      accountId: 'KH-ADM-0001',
      fullName: 'Kampot Harvest Admin',
      email: seedAdminEmail,
      phone: '+855 12 888 001',
      role: 'admin',
      status: 'active',
      verified: true,
      permissions: getRolePermissions('admin', 'active'),
      address: 'Kampot Solar Roastery HQ',
      city: 'Kampot',
      postalCode: '07000',
      discountCode: 'HARVEST15',
      createdAt: '2026-10-01T08:00:00.000Z',
    },
    passwordSalt: seedAdminPassword.salt,
    passwordHash: seedAdminPassword.hash,
  },
  {
    account: migrateAccountRecord({
      accountId: 'KH-USR-1001',
      fullName: 'Sokha Chan',
      email: 'sokha.chan@example.com',
      phone: '+855 12 345 678',
      role: 'user',
      status: 'active',
      verified: true,
      permissions: getRolePermissions('user', 'active'),
      address: 'Street 240, Daun Penh',
      city: 'Phnom Penh',
      postalCode: '12000',
      discountCode: 'HARVEST15',
      createdAt: '2026-10-15T08:00:00.000Z',
    }),
    passwordSalt: seedUserPassword.salt,
    passwordHash: seedUserPassword.hash,
  },
];

const activeSessions = new Map<string, string>(); // token -> accountId

// Live Business Inventory & Stock Movements Store
let inventoryItems: InventoryItem[] = createInitialInventory();
const stockMovements: StockMovementRecord[] = [
  {
    movementId: 'MOV-2026-1001',
    itemId: 'honey-butter-250g-jar',
    sku: 'KH-HB-250J',
    productName: 'Artisan Roasted Cashews — Honey Butter (250g Jar)',
    type: 'restock',
    quantityDelta: 50,
    resultingStock: 62,
    reason: 'Kampot Solar Roastery Batch #KH-408',
    timestamp: '2026-10-22T16:40:00.000Z',
  },
  {
    movementId: 'MOV-2026-1002',
    itemId: 'honey-butter-100g-pouch',
    sku: 'KH-HB-100P',
    productName: 'Artisan Roasted Cashews — Honey Butter (100g Pouch)',
    type: 'sale',
    quantityDelta: -2,
    resultingStock: 84,
    reason: 'Completed Order KH-2026-1042',
    timestamp: '2026-10-22T09:15:00.000Z',
  },
];

function getAuthenticatedAccount(req: Request): UserAccount | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  const accountId = activeSessions.get(token);
  if (!accountId) {
    return null;
  }
  const record = storedAccounts.find((r) => r.account.accountId === accountId);
  if (!record || record.account.status === 'suspended') {
    return null;
  }
  return record.account;
}

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

  // Automatically deduct ordered quantities from live inventory
  const deduction = applyInventoryOrderDeduction(inventoryItems, items, orderId);
  inventoryItems = deduction.updatedInventory;
  if (deduction.movements.length > 0) {
    stockMovements.unshift(...deduction.movements);
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order: newOrder,
  });
});

// Order tracking status check endpoint
app.get('/api/orders/:orderId', (req: Request, res: Response) => {
  const customTracked: TrackedOrder[] = orders.map((o) => ({
    orderId: o.orderId,
    createdAt: new Date(o.createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    estimatedDelivery: 'Within 2–3 Business Days',
    status: o.status === 'shipped' ? 'in_transit' : 'roasting',
    statusLabel: o.status === 'shipped' ? 'In Transit' : 'Small-Batch Roasting & Packing',
    currentLocation: 'Kampot Solar Roastery & Glass Packing Hub',
    carrier: 'Kampot Eco-Express',
    trackingCode: `KEX-${o.orderId.slice(-6)}-KH`,
    customer: {
      name: o.customer.name,
      city: o.customer.city || 'Phnom Penh',
      postalCode: o.customer.postalCode || '12000',
    },
    items: o.items.map((item) => ({
      name: item.name,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      price: item.price,
    })),
    total: o.summary?.total ?? 0,
    timeline: [
      {
        stage: 'confirmed',
        title: 'Order Confirmed',
        location: 'Kampot Harvest Online Store',
        timestamp: 'Just now',
        completed: true,
        current: false,
      },
      {
        stage: 'roasting',
        title: 'Small-Batch Roasted & Glass Sealed',
        location: 'Kampot Solar Roastery, Active Batch',
        timestamp: 'In Progress',
        completed: true,
        current: true,
      },
      {
        stage: 'in_transit',
        title: 'In Transit to Destination Hub',
        location: `${o.customer.city || 'Phnom Penh'} Regional Hub`,
        timestamp: 'Pending Dispatch',
        completed: false,
        current: false,
      },
      {
        stage: 'out_for_delivery',
        title: 'Out for Local Eco-Courier Delivery',
        location: `${o.customer.city || 'Phnom Penh'} (${o.customer.postalCode || '12000'})`,
        timestamp: 'Pending',
        completed: false,
        current: false,
      },
      {
        stage: 'delivered',
        title: 'Delivered',
        location: `${o.customer.name} · ${o.customer.city || 'Phnom Penh'}`,
        timestamp: 'Estimated in 2–3 Days',
        completed: false,
        current: false,
      },
    ],
  }));

  const lookup = lookupOrderStatus(req.params.orderId, customTracked);
  if (!lookup.found || !lookup.order) {
    return res.status(404).json({
      found: false,
      error: lookup.error || 'Order not found',
    });
  }

  return res.json({
    found: true,
    order: lookup.order,
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

// ----------------- User Account & Authentication Endpoints -----------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  const rawInput = req.body as AccountRegistrationInput;

  // Security: Reject any attempt to self-assign admin role via registration API
  if (rawInput?.role === 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin role cannot be assigned through public registration',
      fieldErrors: { role: 'Admin role cannot be assigned through public registration' },
    });
  }

  const input: AccountRegistrationInput = {
    ...rawInput,
    role: 'user',
  };
  const existingUsers = storedAccounts.map((r) => r.account);

  const creation = createUserAccount(input, existingUsers);
  if (!creation.success || !creation.account) {
    const statusCode = creation.error?.includes('already exists') ? 409 : 400;
    return res.status(statusCode).json({
      success: false,
      error: creation.error || 'Invalid registration data',
      fieldErrors: creation.fieldErrors || {},
    });
  }

  const { salt, hash } = hashPassword(input.password);
  storedAccounts.push({
    account: creation.account,
    passwordSalt: salt,
    passwordHash: hash,
  });

  // Automatically add new account to VIP newsletter list
  if (!subscribers.some((s) => s.email.toLowerCase() === creation.account!.email)) {
    subscribers.push({
      email: creation.account.email,
      subscribedAt: creation.account.createdAt,
    });
  }

  const token = crypto.randomBytes(24).toString('hex');
  activeSessions.set(token, creation.account.accountId);

  return res.status(201).json({
    success: true,
    message: 'Welcome to Kampot Harvest! Your account is active and 15% VIP discount is unlocked.',
    account: creation.account,
    token,
  });
});

// ----------------- Protected Admin Inventory Endpoints -----------------

app.get('/api/admin/inventory', (req: Request, res: Response) => {
  const account = getAuthenticatedAccount(req);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in with an administrator account.',
    });
  }
  if (!isAdminAccount(account)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only authorized administrators can access business inventory.',
    });
  }

  const stats = calculateInventoryStats(inventoryItems);
  return res.json({
    success: true,
    inventory: inventoryItems,
    stats,
    movements: stockMovements.slice(0, 25),
  });
});

app.post('/api/admin/inventory/adjust', (req: Request, res: Response) => {
  const account = getAuthenticatedAccount(req);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in with an administrator account.',
    });
  }
  if (!isAdminAccount(account)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only authorized administrators can modify business inventory.',
    });
  }

  const { itemId, quantityDelta, type, reason } = req.body as {
    itemId?: string;
    quantityDelta?: number;
    type?: 'restock' | 'return' | 'adjustment';
    reason?: string;
  };

  if (!itemId || quantityDelta === undefined) {
    return res.status(400).json({
      success: false,
      error: 'itemId and quantityDelta are required',
    });
  }

  const result = adjustInventoryStock(
    inventoryItems,
    itemId,
    Number(quantityDelta),
    type || 'adjustment',
    reason || `Adjusted by ${account.fullName}`
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error || 'Failed to adjust inventory',
    });
  }

  inventoryItems = result.updatedInventory;
  if (result.movement) {
    stockMovements.unshift(result.movement);
  }

  return res.json({
    success: true,
    message: `Inventory updated for ${result.updatedItem?.name}`,
    item: result.updatedItem,
    inventory: inventoryItems,
    stats: calculateInventoryStats(inventoryItems),
    movements: stockMovements.slice(0, 25),
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please enter both email and password',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = storedAccounts.find(
    (r) => r.account.email.toLowerCase() === normalizedEmail
  );

  if (!record || !verifyPasswordHash(password, record.passwordSalt, record.passwordHash)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
  }

  if (record.account.status === 'suspended') {
    return res.status(403).json({
      success: false,
      error: 'This account has been suspended. Please contact support.',
    });
  }

  const token = crypto.randomBytes(24).toString('hex');
  activeSessions.set(token, record.account.accountId);

  return res.json({
    success: true,
    message: `Welcome back, ${record.account.fullName}!`,
    account: record.account,
    token,
  });
});

app.post('/api/auth/verify', (req: Request, res: Response) => {
  const { accountId } = req.body as { accountId?: string };
  const record = storedAccounts.find((r) => r.account.accountId === accountId);

  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'Account not found',
    });
  }

  record.account = verifyUserAccount(record.account);

  return res.json({
    success: true,
    message: 'Business verification complete! Wholesale bulk ordering is now unlocked.',
    account: record.account,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    activeSessions.delete(token);
  }
  return res.json({ success: true });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.slice(7);
  const accountId = activeSessions.get(token);
  if (!accountId) {
    return res.status(401).json({ authenticated: false });
  }
  const record = storedAccounts.find((r) => r.account.accountId === accountId);
  if (!record) {
    return res.status(401).json({ authenticated: false });
  }

  const userOrders = orders.filter(
    (o) => o.customer.email.toLowerCase() === record.account.email.toLowerCase()
  );

  return res.json({
    authenticated: true,
    account: record.account,
    orders: userOrders,
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
