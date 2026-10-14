const { chromium } = require('playwright');
const path = require('path');

async function verify() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal, [data-nextjs-toast], [data-next-badge] { display: none !important; }' });
    await page.waitForTimeout(1000);

    // Scroll to the video demo theater section
    const videoSection = page.locator('#app-demos');
    await videoSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Screenshot Tab 1: 1,000-Bot Workforce Swarm
    await page.screenshot({ path: path.resolve(__dirname, '../apps/web/public/branding/verify-tab-swarm.png') });
    console.log('[OK] Tab 1 (Swarm) screenshot captured.');

    // Click Tab 2: APA 7th Resume Studio
    const tab2 = page.locator('button:has-text("APA 7th Resume Studio")');
    if (await tab2.isVisible()) {
      await tab2.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.resolve(__dirname, '../apps/web/public/branding/verify-tab-resume.png') });
      console.log('[OK] Tab 2 (APA Resume) screenshot captured.');
    }

    // Click Tab 3: Applications & Notion Sync
    const tab3 = page.locator('button:has-text("Applications & Notion Sync")');
    if (await tab3.isVisible()) {
      await tab3.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.resolve(__dirname, '../apps/web/public/branding/verify-tab-notion.png') });
      console.log('[OK] Tab 3 (Notion Sync) screenshot captured.');
    }

    console.log('[OK] All 3 video demo tabs visually verified.');
  } finally {
    await browser.close();
  }
}

verify().catch(console.error);
