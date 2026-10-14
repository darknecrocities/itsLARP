const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const PUBLIC_DEMOS_DIR = path.resolve(__dirname, '../apps/web/public/demos');
const TMP_REC_DIR = path.resolve(__dirname, '../.swarm_rec_tmp');

if (!fs.existsSync(TMP_REC_DIR)) fs.mkdirSync(TMP_REC_DIR, { recursive: true });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function smoothScroll(page, targetY, durationMs = 1200) {
  await page.evaluate(
    async ({ targetY, durationMs }) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();

      return new Promise((resolve) => {
        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          window.scrollTo(0, startY + diff * ease);
          if (progress < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    },
    { targetY, durationMs }
  );
  await wait(300);
}

async function record() {
  console.log('▲ Recording Workforce Swarm Demo directly on /agents...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  try {
    const ctx = await browser.newContext({
      recordVideo: {
        dir: TMP_REC_DIR,
        size: { width: 1280, height: 720 },
      },
      viewport: { width: 1280, height: 720 },
    });
    const page = await ctx.newPage();

    // Seed profile and clean dev UI
    await page.addStyleTag({ content: 'nextjs-portal, [data-nextjs-toast], [data-next-badge] { display: none !important; }' });
    await page.goto('http://localhost:3000/agents', { waitUntil: 'networkidle' });
    await wait(1200);

    // Launch Swarm simulation
    const launchBtn = page.locator('button:has-text("Launch 1,000 Agents"), button:has-text("Start Agents")').first();
    if (await launchBtn.isVisible()) {
      await launchBtn.hover();
      await wait(600);
      await launchBtn.click();
      await wait(2000);
    }

    // Scroll through the active swarm pools
    await smoothScroll(page, 280, 1000);
    await wait(1800);

    // Click between Pipeline Stages tabs
    const stagesTab = page.locator('button:has-text("Pipeline Stages")');
    if (await stagesTab.isVisible()) {
      await stagesTab.click();
      await wait(1800);
    }

    // Scroll further down to observe agent feed and 2FA handlers
    await smoothScroll(page, 550, 1000);
    await wait(2000);

    // Scroll back up to the swarm summary metrics
    await smoothScroll(page, 0, 1000);
    await wait(2000);

    await page.close();
    const rawWebm = await page.video().path();
    await ctx.close();

    const mp4Path = path.join(PUBLIC_DEMOS_DIR, 'workforce-swarm-demo.mp4');
    const webmPath = path.join(PUBLIC_DEMOS_DIR, 'workforce-swarm-demo.webm');
    const posterPath = path.join(PUBLIC_DEMOS_DIR, 'workforce-swarm-demo-poster.jpg');

    execSync(
      `/opt/homebrew/bin/ffmpeg -y -i "${rawWebm}" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -movflags +faststart -an "${mp4Path}"`,
      { stdio: 'inherit' }
    );
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -i "${rawWebm}" -c:v libvpx-vp9 -b:v 1200k -crf 32 -an "${webmPath}"`,
      { stdio: 'inherit' }
    );
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -ss 00:00:03 -i "${mp4Path}" -vframes 1 -q:v 2 "${posterPath}"`,
      { stdio: 'inherit' }
    );

    console.log('✓ Workforce Swarm demo recorded and processed!');
  } finally {
    await browser.close();
    try { fs.rmSync(TMP_REC_DIR, { recursive: true, force: true }); } catch {}
  }
}

record().catch(console.error);
