import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

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

export async function runAudit() {
  console.log('🚀 Starting Cross-Device & Viewport Audit...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const report: any = {
    viewports: [],
    consoleErrors: [],
    overflowIssues: [],
    touchTargetIssues: [],
    userJourneys: {},
  };

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      report.consoleErrors.push({ text: msg.text(), location: msg.location() });
    }
  });

  page.on('pageerror', (err: any) => {
    report.consoleErrors.push({ text: err?.message || String(err), stack: err?.stack });
  });

  // 1. Audit viewports for horizontal overflow
  for (const vp of VIEWPORTS) {
    console.log(`\n🔍 Checking Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    // Check for overflow
    const overflowInfo = await page.evaluate((viewportWidth) => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = doc.clientWidth;
      const hasOverflow = scrollWidth > clientWidth;

      let overflowingElements: Array<{ tag: string; id: string; className: string; right: number; width: number }> = [];

      if (hasOverflow) {
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > viewportWidth + 1) {
            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              id: el.id,
              className: (el.className || '').toString().slice(0, 80),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            });
          }
        });
      }

      return {
        hasOverflow,
        scrollWidth,
        clientWidth,
        overflowingElements: overflowingElements.slice(0, 10),
      };
    }, vp.width);

    report.viewports.push({
      ...vp,
      ...overflowInfo,
    });

    if (overflowInfo.hasOverflow) {
      console.warn(`  ⚠️ OVERFLOW detected on ${vp.name}! ScrollWidth: ${overflowInfo.scrollWidth} vs ClientWidth: ${overflowInfo.clientWidth}`);
      console.warn(`  Offenders:`, overflowInfo.overflowingElements);
      report.overflowIssues.push({ viewport: vp.name, ...overflowInfo });
    } else {
      console.log(`  ✅ Clean layout. No horizontal overflow.`);
    }
  }

  // 2. Audit interactive flows on Mobile (375x667)
  console.log('\n🧪 Testing Mobile Interactions (375x667)...');
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // Test Mobile Nav & Menu toggle
  const mobileMenuTest = await page.evaluate(async () => {
    const burgerBtn = document.querySelector('button[aria-label="Toggle menu"], button[aria-label*="menu" i]') as HTMLElement;
    if (!burgerBtn) return { success: false, reason: 'Burger button not found' };
    burgerBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    const navOpen = document.querySelector('[role="dialog"], [aria-modal="true"], nav.block, nav') !== null;
    return { success: true, burgerFound: true, navOpen };
  });
  report.userJourneys.mobileMenu = mobileMenuTest;
  console.log('  Mobile Menu Test:', mobileMenuTest);

  // 3. Test Language Switching on Desktop
  console.log('\n🧪 Testing i18n Switching on Desktop (1280x800)...');
  await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  const i18nTest = await page.evaluate(async () => {
    // Find language selector button or select
    const langSelect = document.querySelector('select[aria-label*="language" i], select[title*="language" i], select') as HTMLSelectElement;
    const initialText = document.body.innerText.slice(0, 300);
    return { hasLangSelect: !!langSelect, initialTextSnippet: initialText.slice(0, 60) };
  });
  report.userJourneys.i18n = i18nTest;
  console.log('  i18n Test:', i18nTest);

  // 4. Test Add to Cart & Drawer
  console.log('\n🧪 Testing Add to Cart Flow...');
  const cartTest = await page.evaluate(async () => {
    const addButtons = Array.from(document.querySelectorAll('button')).filter((b) =>
      /add to cart|order now|claim/i.test(b.innerText)
    );
    if (addButtons.length === 0) return { success: false, reason: 'No add button found' };
    
    // Click first add to cart button
    const btn = addButtons[0] as HTMLElement;
    btn.click();
    await new Promise((r) => setTimeout(r, 600));

    // Check if cart drawer or toast opened
    const toast = document.querySelector('.fixed.bottom-6, [role="alert"]');
    const cartDrawer = document.querySelector('[aria-label*="cart" i], .fixed.inset-y-0.right-0');

    return {
      success: true,
      buttonClicked: btn.innerText.trim(),
      hasToast: !!toast,
      hasCartDrawer: !!cartDrawer,
    };
  });
  report.userJourneys.cart = cartTest;
  console.log('  Cart Test:', cartTest);

  await browser.close();

  console.log('\n📊 AUDIT SUMMARY:');
  console.log(`- Viewports checked: ${report.viewports.length}`);
  console.log(`- Overflow issues: ${report.overflowIssues.length}`);
  console.log(`- Console errors: ${report.consoleErrors.length}`);
  if (report.consoleErrors.length > 0) {
    console.warn('Console errors found:', report.consoleErrors);
  }

  return report;
}

runAudit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
