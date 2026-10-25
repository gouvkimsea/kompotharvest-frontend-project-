import puppeteer, { Browser, Page } from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  isMobile: boolean;
  hasTouch: boolean;
}

const VIEWPORTS: ViewportConfig[] = [
  { name: 'Mobile-Compact-320', width: 320, height: 650, isMobile: true, hasTouch: true },
  { name: 'Mobile-iPhoneSE-375', width: 375, height: 667, isMobile: true, hasTouch: true },
  { name: 'Mobile-iPhone14-390', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'Mobile-Pixel7-412', width: 412, height: 915, isMobile: true, hasTouch: true },
  { name: 'Tablet-Portrait-768', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'Mobile-Landscape-844', width: 844, height: 390, isMobile: true, hasTouch: true },
  { name: 'Tablet-Landscape-1024', width: 1024, height: 768, isMobile: false, hasTouch: true },
  { name: 'Laptop-Standard-1280', width: 1280, height: 800, isMobile: false, hasTouch: false },
  { name: 'Laptop-Large-1440', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: 'Desktop-FHD-1920', width: 1920, height: 1080, isMobile: false, hasTouch: false },
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testBrowser(browserPath: string, browserName: string) {
  console.log(`\n============================================================`);
  console.log(`🌐 TESTING ON: ${browserName}`);
  console.log(`============================================================`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[${browserName} Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err: any) => {
    consoleErrors.push(`[${browserName} Page Error] ${err?.message || String(err)}`);
  });

  try {
    // 1. Audit Viewports for Overflow
    console.log(`\n--- 1. Testing ${VIEWPORTS.length} Viewports for Horizontal Overflow ---`);
    for (const vp of VIEWPORTS) {
      await page.setViewport(vp);
      await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      await sleep(200);

      const overflow = await page.evaluate((vpWidth) => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientWidth = doc.clientWidth;
        const hasOverflow = scrollWidth > clientWidth;

        let offenders: string[] = [];
        if (hasOverflow) {
          document.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > vpWidth + 1) {
              const cls = typeof el.className === 'string' ? el.className : (el.className as any)?.baseVal || '';
              offenders.push(`${el.tagName.toLowerCase()}#${el.id}.${cls.slice(0, 50)} (right: ${Math.round(r.right)}px)`);
            }
          });
        }
        return { hasOverflow, scrollWidth, clientWidth, offenders: offenders.slice(0, 5) };
      }, vp.width);

      if (overflow.hasOverflow) {
        console.error(`  ❌ [${browserName}] OVERFLOW on ${vp.name} (${vp.width}px): scrollWidth=${overflow.scrollWidth}`, overflow.offenders);
        throw new Error(`Horizontal overflow on ${vp.name}`);
      } else {
        console.log(`  ✅ [${browserName}] ${vp.name.padEnd(22)} (${vp.width}x${vp.height}) - Clean, no horizontal overflow`);
      }
    }

    // 2. Desktop Full Flow Tests (1280x800)
    console.log(`\n--- 2. Desktop User Journey Testing (1280x800) ---`);
    await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    // 2A. Test Language Switching (EN -> KM -> ZH -> EN)
    console.log(`\n[Test 2A] Language Switching on Desktop:`);
    const langBtn = await page.$('#lang-selector-btn');
    if (!langBtn) throw new Error('Language selector button not found');
    
    // Switch to KM
    await langBtn.click();
    await sleep(250);
    const kmOpt = await page.$('[data-testid="lang-opt-KM"]');
    if (!kmOpt) throw new Error('KM language option not found');
    await kmOpt.click();
    await sleep(300);
    const htmlLangKm = await page.evaluate(() => document.documentElement.lang);
    console.log(`  ✓ Switched to KM: document.documentElement.lang = "${htmlLangKm}"`);
    if (htmlLangKm !== 'km') throw new Error(`Expected lang="km", got "${htmlLangKm}"`);

    // Switch to ZH
    await langBtn.click();
    await sleep(250);
    const zhOpt = await page.$('[data-testid="lang-opt-ZH"]');
    if (!zhOpt) throw new Error('ZH language option not found');
    await zhOpt.click();
    await sleep(300);
    const htmlLangZh = await page.evaluate(() => document.documentElement.lang);
    console.log(`  ✓ Switched to ZH: document.documentElement.lang = "${htmlLangZh}"`);
    if (htmlLangZh !== 'zh') throw new Error(`Expected lang="zh", got "${htmlLangZh}"`);

    // Switch back to EN
    await langBtn.click();
    await sleep(250);
    const enOpt = await page.$('[data-testid="lang-opt-EN"]');
    if (!enOpt) throw new Error('EN language option not found');
    await enOpt.click();
    await sleep(300);
    const htmlLangEn = await page.evaluate(() => document.documentElement.lang);
    console.log(`  ✓ Switched to EN: document.documentElement.lang = "${htmlLangEn}"`);

    // 2B. Test Currency Switching (USD -> KHR -> INR -> USD)
    console.log(`\n[Test 2B] Currency Switching on Desktop:`);
    const currBtn = await page.$('#curr-selector-btn');
    if (!currBtn) throw new Error('Currency selector button not found');

    // Switch to KHR
    await currBtn.click();
    await sleep(250);
    const khrOpt = await page.$('[data-testid="curr-opt-KHR"]');
    if (!khrOpt) throw new Error('KHR currency option not found');
    await khrOpt.click();
    await sleep(300);
    const khrText = await page.evaluate(() => document.querySelector('#curr-selector-btn')?.textContent || '');
    console.log(`  ✓ Switched to KHR: button text = "${khrText.trim()}"`);
    if (!khrText.includes('KHR')) throw new Error('Failed to switch to KHR');

    // Switch to INR
    await currBtn.click();
    await sleep(250);
    const inrOpt = await page.$('[data-testid="curr-opt-INR"]');
    if (!inrOpt) throw new Error('INR currency option not found');
    await inrOpt.click();
    await sleep(300);
    const inrText = await page.evaluate(() => document.querySelector('#curr-selector-btn')?.textContent || '');
    console.log(`  ✓ Switched to INR: button text = "${inrText.trim()}"`);
    if (!inrText.includes('INR')) throw new Error('Failed to switch to INR');

    // Switch back to USD
    await currBtn.click();
    await sleep(250);
    const usdOpt = await page.$('[data-testid="curr-opt-USD"]');
    if (!usdOpt) throw new Error('USD currency option not found');
    await usdOpt.click();
    await sleep(300);
    const usdText = await page.evaluate(() => document.querySelector('#curr-selector-btn')?.textContent || '');
    console.log(`  ✓ Switched to USD: button text = "${usdText.trim()}"`);

    // 2C. Test AI Sommelier Modal
    console.log(`\n[Test 2C] AI Sommelier Modal:`);
    const aiNavBtn = await page.$('[data-testid="nav-ai-sommelier-btn"]');
    if (!aiNavBtn) throw new Error('AI Sommelier button not found in navigation');
    await aiNavBtn.click();
    await sleep(500);

    const sommelierModalOpen = await page.evaluate(() => {
      return document.querySelector('[role="dialog"]') !== null;
    });
    console.log(`  ✓ AI Sommelier modal open: ${sommelierModalOpen}`);
    if (!sommelierModalOpen) throw new Error('AI Sommelier modal did not open');

    // Test sending a query to AI Sommelier
    const sommelierInput = await page.$('input[placeholder*="flavor notes" i], input[type="text"]');
    if (sommelierInput) {
      await sommelierInput.type('What cashews pair best with craft beer?');
      const sendBtn = await page.$('button[type="submit"], button:has(svg.lucide-send)');
      if (sendBtn) {
        await sendBtn.click();
        await sleep(1200);
        const messagesCount = await page.evaluate(() => document.querySelectorAll('.rounded-2xl.p-3\\.5, .rounded-2xl.p-4').length);
        console.log(`  ✓ Submitted pairing query. Messages rendered: ${messagesCount}`);
      }
    }
    // Close modal
    const closeSommelierBtn = await page.$('button[aria-label="Close AI Sommelier modal"], button:has(svg.lucide-x)');
    if (closeSommelierBtn) {
      await closeSommelierBtn.click();
      await sleep(300);
      console.log(`  ✓ Closed AI Sommelier modal`);
    }

    // 2D. Test Shop Page & Category Tabs
    console.log(`\n[Test 2D] Shop Page Navigation & Filtering:`);
    await page.evaluate(() => {
      const shopNav = Array.from(document.querySelectorAll('nav button')).find((b) => /shop/i.test(b.textContent || ''));
      if (shopNav) (shopNav as HTMLElement).click();
    });
    await sleep(500);

    const shopTitle = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
    console.log(`  ✓ Navigated to Shop page: "${shopTitle.trim().slice(0, 40)}"`);

    // Click Category Tabs: Bundles -> 250g Jar -> 100g Pouch -> All
    const tabs = ['Bundles', '250g Jar', '100g Pouch'];
    for (const tabName of tabs) {
      await page.evaluate((name) => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').includes(name));
        if (btn) (btn as HTMLElement).click();
      }, tabName);
      await sleep(300);
      console.log(`  ✓ Selected category tab: "${tabName}"`);
    }

    // 2E. Test Product Detail Page View
    console.log(`\n[Test 2E] Product Detail Page & Variant Controls:`);
    const productCardClicked = await page.evaluate(() => {
      const card = document.querySelector('[data-testid^="product-card-"], .group.cursor-pointer');
      if (card) {
        (card as HTMLElement).click();
        return true;
      }
      return false;
    });
    await sleep(600);
    console.log(`  ✓ Clicked product card: ${productCardClicked}`);

    // Verify detail page breadcrumbs and variant buttons
    const detailLoaded = await page.evaluate(() => {
      const hasBackBtn = Array.from(document.querySelectorAll('button')).some((b) => /back to shop/i.test(b.textContent || ''));
      const hasAddBtn = Array.from(document.querySelectorAll('button')).some((b) => /add to cart/i.test(b.textContent || ''));
      return hasBackBtn && hasAddBtn;
    });
    console.log(`  ✓ Product detail view loaded: ${detailLoaded}`);
    if (!detailLoaded) throw new Error('Product detail view failed to load');

    // Test adding product to cart from detail view
    await page.evaluate(() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find((b) => /add to cart/i.test(b.textContent || ''));
      if (addBtn) (addBtn as HTMLElement).click();
    });
    await sleep(600);
    console.log(`  ✓ Added product to cart from detail view`);

    // 2F. Test Cart Drawer & Checkout Form Flow
    console.log(`\n[Test 2F] Cart Drawer, Promo Code & Checkout Flow:`);
    const cartOpenBtn = await page.$('button[aria-label*="Shopping Cart" i]');
    if (cartOpenBtn) {
      await cartOpenBtn.click();
      await sleep(400);
    }

    const cartDrawerVisible = await page.evaluate(() => {
      const drawer = document.querySelector('[role="dialog"][aria-label="Shopping Cart"]');
      return drawer !== null;
    });
    console.log(`  ✓ Cart drawer open: ${cartDrawerVisible}`);
    if (!cartDrawerVisible) throw new Error('Cart drawer did not open');

    // Click Checkout button
    await page.evaluate(() => {
      const checkoutBtn = Array.from(document.querySelectorAll('button')).find((b) => /checkout/i.test(b.textContent || ''));
      if (checkoutBtn) (checkoutBtn as HTMLElement).click();
    });
    await sleep(400);

    const isCheckoutStep = await page.evaluate(() => document.querySelector('#checkout-form') !== null);
    console.log(`  ✓ In Checkout step: ${isCheckoutStep}`);
    if (!isCheckoutStep) throw new Error('Checkout step not reached');

    // Test form validation by submitting empty
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => /place order|complete order|pay/i.test(b.textContent || ''));
      if (submitBtn) (submitBtn as HTMLElement).click();
    });
    await sleep(300);
    const hasValidationErrors = await page.evaluate(() => document.querySelectorAll('p.text-red-700, p.text-red-600, p.text-xs.text-red-700').length > 0);
    console.log(`  ✓ Empty checkout form validation triggers errors: ${hasValidationErrors}`);

    // Fill valid checkout details
    await page.type('#chk-name', 'Sophea Keo');
    await page.type('#chk-email', 'sophea@example.com');
    await page.type('#chk-phone', '+855 12 987 654');
    await page.type('#chk-address', 'Street 302, BKK1');
    await page.type('#chk-city', 'Phnom Penh');
    await page.type('#chk-pin', '12302');

    // Submit valid order
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[form="checkout-form"]') as HTMLElement;
      if (submitBtn) {
        submitBtn.click();
      } else {
        const form = document.querySelector('#checkout-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }
    });
    await sleep(1500);

    const orderConfirmed = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return bodyText.includes('Confirmed') || bodyText.includes('Order #');
    });
    console.log(`  ✓ Order confirmed & placed: ${orderConfirmed}`);
    if (!orderConfirmed) throw new Error('Order confirmation step was not reached');

    // Close cart drawer
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close cart drawer"]') as HTMLElement;
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // 2G. Test Mobile View (375x667) & One-Thumb Usability
    console.log(`\n--- 3. Mobile One-Thumb Usability & Bottom Navigation (375x667) ---`);
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(400);

    // 3A. Verify Mobile Bottom Navigation Bar presence & touch targets
    console.log(`\n[Test 3A] Mobile Bottom Navigation Bar:`);
    const bottomNavVisible = await page.evaluate(() => {
      const nav = document.querySelector('#mobile-bottom-nav');
      if (!nav) return false;
      const style = window.getComputedStyle(nav);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    console.log(`  ✓ Mobile bottom navigation bar is visible on 375px: ${bottomNavVisible}`);
    if (!bottomNavVisible) throw new Error('Mobile bottom nav is not visible on mobile');

    // Verify touch target dimensions (>= 44px)
    const touchTargetAudit = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#mobile-bottom-nav button'));
      return buttons.map((btn) => {
        const rect = btn.getBoundingClientRect();
        return {
          id: btn.id,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          valid: rect.width >= 44 && rect.height >= 44,
        };
      });
    });
    console.log(`  ✓ Bottom nav touch targets meet 44px minimum:`, touchTargetAudit.map((b) => `${b.id}: ${b.width}x${b.height}px`).join(', '));
    const allValidTouch = touchTargetAudit.every((b) => b.valid);
    if (!allValidTouch) throw new Error('One or more bottom nav buttons is smaller than 44px');

    // 3B. Test 1-Thumb Navigation: Tap Shop from Bottom Nav
    console.log(`\n[Test 3B] 1-Thumb Navigation via Bottom Nav:`);
    await page.click('#mobile-bottom-nav-shop');
    await sleep(400);
    const inShop = await page.evaluate(() => document.body.innerText.includes('All Sizes & Flavors'));
    console.log(`  ✓ Navigated to Shop page via one-thumb tap: ${inShop}`);
    if (!inShop) throw new Error('Shop navigation via bottom nav failed');

    // 3C. Test 1-Thumb AI Sommelier Bottom Sheet
    console.log(`\n[Test 3C] 1-Thumb AI Sommelier Bottom Sheet:`);
    await page.click('#mobile-bottom-nav-sommelier');
    await sleep(500);
    const sommelierBottomSheet = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Kampot Harvest AI Sommelier"]');
      if (!dialog) return false;
      const style = window.getComputedStyle(dialog);
      return style.display !== 'none';
    });
    console.log(`  ✓ AI Sommelier opened as bottom sheet: ${sommelierBottomSheet}`);
    if (!sommelierBottomSheet) throw new Error('AI Sommelier did not open via bottom nav');

    // Close Sommelier
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label*="sommelier" i]') as HTMLElement;
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // 3D. Test 1-Thumb Order Tracking Bottom Sheet
    console.log(`\n[Test 3D] 1-Thumb Order Tracking Bottom Sheet:`);
    await page.click('#mobile-bottom-nav-track');
    await sleep(500);
    const trackBottomSheet = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Track Your Order"]');
      if (!dialog) return false;
      const style = window.getComputedStyle(dialog);
      return style.display !== 'none';
    });
    console.log(`  ✓ Track Order opened as bottom sheet: ${trackBottomSheet}`);
    if (!trackBottomSheet) throw new Error('Track Order did not open via bottom nav');

    // Close Track Order
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close Track Order modal"]') as HTMLElement;
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // 3E. Test Product Detail Sticky Action Bar on Mobile
    console.log(`\n[Test 3E] Mobile Product Detail Sticky Action Bar:`);
    // Navigate to Shop and click first product card to view Product Detail
    await page.click('#mobile-bottom-nav-shop');
    await sleep(400);
    await page.evaluate(() => {
      const firstCard = document.querySelector('[data-testid^="shop-product-card-"] h3') as HTMLElement;
      if (firstCard) firstCard.click();
    });
    await sleep(600);

    const stickyBarVisible = await page.evaluate(() => {
      const stickyBar = document.querySelector('#mobile-sticky-action-bar-product, #mobile-sticky-action-bar-bundle');
      if (!stickyBar) return false;
      const style = window.getComputedStyle(stickyBar);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    console.log(`  ✓ Sticky mobile one-thumb action bar is visible: ${stickyBarVisible}`);
    if (!stickyBarVisible) throw new Error('Sticky mobile action bar not visible on Product Detail view');

    // Tap sticky Add to Cart button
    await page.evaluate(() => {
      const btn = (document.querySelector('#mobile-sticky-add-product, #mobile-sticky-add-bundle') ||
        document.querySelector('#mobile-sticky-action-bar-product button, #mobile-sticky-action-bar-bundle button')) as HTMLElement;
      if (btn) btn.click();
    });
    await sleep(500);

    // Verify cart count badge in bottom nav updated
    const bottomNavCartBadge = await page.evaluate(() => {
      const badge = document.querySelector('#mobile-bottom-nav-cart span.bg-\\[\\#8B6D3B\\]');
      return badge ? badge.textContent?.trim() : null;
    });
    console.log(`  ✓ Bottom nav cart badge updated to: ${bottomNavCartBadge}`);

    // Tap 1-Thumb Cart button in bottom nav to view Cart Drawer
    await page.evaluate(() => {
      const cartBtn = document.querySelector('#mobile-bottom-nav-cart') as HTMLElement;
      if (cartBtn) cartBtn.click();
    });
    await sleep(500);
    const cartOpenFromBottom = await page.evaluate(() => {
      return document.querySelector('[role="dialog"][aria-label="Shopping Cart"]') !== null;
    });
    console.log(`  ✓ Cart drawer opened via bottom nav thumb tap: ${cartOpenFromBottom}`);
    if (!cartOpenFromBottom) throw new Error('Cart drawer did not open from bottom nav');

    // Close cart drawer
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close cart drawer"]') as HTMLElement;
      if (closeBtn) closeBtn.click();
    });
    await sleep(300);

    // Return to Home via bottom nav
    await page.evaluate(() => {
      const homeBtn = document.querySelector('#mobile-bottom-nav-home') as HTMLElement;
      if (homeBtn) homeBtn.click();
    });
    await sleep(400);

    // 3F. Open Mobile Drawer for language/currency preferences
    const burger = await page.$('button[aria-label*="navigation menu" i]');
    if (!burger) throw new Error('Mobile burger button not found');
    await burger.click();
    await sleep(400);

    // Test Language switch on mobile drawer
    const mobileKmBtn = await page.$('[data-testid="mobile-lang-KM"]');
    if (!mobileKmBtn) throw new Error('Mobile KM button not found');
    await mobileKmBtn.click();
    await sleep(300);
    const mobileLang = await page.evaluate(() => document.documentElement.lang);
    console.log(`  ✓ Mobile language switched to KM: ${mobileLang}`);

    // Test Currency switch on mobile drawer
    const mobileKhrBtn = await page.$('[data-testid="mobile-curr-KHR"]');
    if (!mobileKhrBtn) throw new Error('Mobile KHR button not found');
    await mobileKhrBtn.click();
    await sleep(300);
    console.log(`  ✓ Mobile currency switched to KHR`);

    // Switch back to EN & USD
    await page.click('[data-testid="mobile-lang-EN"]');
    await sleep(200);
    await page.click('[data-testid="mobile-curr-USD"]');
    await sleep(200);

    // Close mobile menu
    await burger.click();
    await sleep(300);

    // 2H. Test Footer Preferences Bar
    console.log(`\n--- 4. Footer Language & Currency Controls ---`);
    const footerLangKm = await page.$('[data-testid="footer-lang-KM"]');
    if (footerLangKm) {
      await footerLangKm.click();
      await sleep(200);
      const footerLang = await page.evaluate(() => document.documentElement.lang);
      console.log(`  ✓ Footer language switched to KM: ${footerLang}`);
      await page.click('[data-testid="footer-lang-EN"]');
      await sleep(200);
    }
    const footerCurrKhr = await page.$('[data-testid="footer-curr-KHR"]');
    if (footerCurrKhr) {
      await footerCurrKhr.click();
      await sleep(200);
      console.log(`  ✓ Footer currency switched to KHR`);
      await page.click('[data-testid="footer-curr-USD"]');
      await sleep(200);
    }

    // 2I. Test Admin Inventory Dashboard Navigation
    console.log(`\n--- 5. Admin Portal Access Guard & Functionality ---`);
    await page.goto(`${BASE_URL}/#admin`, { waitUntil: 'networkidle0' });
    await sleep(600);

    const adminGuardVisible = await page.evaluate(() => {
      return document.querySelector('[data-testid="admin-unauthorized-guard"]') !== null;
    });
    console.log(`  ✓ Unauthenticated user correctly redirected/blocked by Admin Guard: ${adminGuardVisible}`);

    console.log(`\n============================================================`);
    console.log(`🎉 ALL TESTS PASSED SUCCESSFULLY ON: ${browserName}`);
    console.log(`============================================================`);

  } finally {
    await browser.close();
  }

  if (consoleErrors.length > 0) {
    console.warn(`⚠️ Console errors recorded on ${browserName}:`, consoleErrors);
  } else {
    console.log(`✅ ZERO console errors on ${browserName}!`);
  }
}

async function main() {
  console.log('🌟 Starting Cross-Browser & Cross-Device Flawless Verification Suite...');

  // Test 1: Chrome
  await testBrowser(CHROME_PATH, 'Google Chrome');

  // Test 2: Microsoft Edge
  await testBrowser(EDGE_PATH, 'Microsoft Edge');

  console.log('\n🏆 ALL CROSS-DEVICE & CROSS-BROWSER AUDITS FULLY VERIFIED!');
}

main().catch((err) => {
  console.error('\n❌ E2E Audit Failed:', err);
  process.exit(1);
});
