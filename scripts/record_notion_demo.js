const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const PUBLIC_DEMOS_DIR = path.resolve(__dirname, '../apps/web/public/demos');
const TMP_REC_DIR = path.resolve(__dirname, '../.recordings_tmp_notion');

if (!fs.existsSync(PUBLIC_DEMOS_DIR)) {
  fs.mkdirSync(PUBLIC_DEMOS_DIR, { recursive: true });
}
if (!fs.existsSync(TMP_REC_DIR)) {
  fs.mkdirSync(TMP_REC_DIR, { recursive: true });
}

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
          const ease =
            progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          window.scrollTo(0, startY + diff * ease);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    },
    { targetY, durationMs }
  );
  await wait(300);
}

function processVideo(rawWebmPath, baseName) {
  const mp4Path = path.join(PUBLIC_DEMOS_DIR, `${baseName}.mp4`);
  const webmPath = path.join(PUBLIC_DEMOS_DIR, `${baseName}.webm`);
  const posterPath = path.join(PUBLIC_DEMOS_DIR, `${baseName}-poster.jpg`);

  console.log(`\nEncoding ${baseName} with ffmpeg...`);

  execSync(
    `/opt/homebrew/bin/ffmpeg -y -i "${rawWebmPath}" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -movflags +faststart -an "${mp4Path}"`,
    { stdio: 'inherit' }
  );

  execSync(
    `/opt/homebrew/bin/ffmpeg -y -i "${rawWebmPath}" -c:v libvpx-vp9 -b:v 1200k -crf 32 -an "${webmPath}"`,
    { stdio: 'inherit' }
  );

  execSync(
    `/opt/homebrew/bin/ffmpeg -y -ss 00:00:02 -i "${mp4Path}" -vframes 1 -q:v 2 "${posterPath}"`,
    { stdio: 'inherit' }
  );

  console.log(`✓ Updated ${baseName}.mp4, ${baseName}.webm, and ${baseName}-poster.jpg`);
}

async function seedData(page) {
  await page.addInitScript(() => {
    const fullState = {
      state: {
        profile: {
          name: "Jane Doe",
          headline: "Lead AI Systems & Full Stack Engineer",
          email: "jane.doe@example.com",
          location: "San Francisco, CA (Remote)",
          years: 5,
          skills: ["Python", "FastAPI", "React", "TypeScript", "Docker", "PostgreSQL", "PyTorch", "Tailwind CSS"],
          education: "Bachelor of Science in Computer Science, Stanford University",
          experience: [
            {
              company: "Anthropic Labs",
              title: "Senior AI Systems Engineer",
              text: "Architected distributed agent runtime executing 100,000+ autonomous parallel tasks with verifiable zero-hallucination gates."
            }
          ],
          projects: [
            {
              name: "Autonomous Task Engine",
              tech: ["Python", "FastAPI", "React", "Docker"],
              text: "High-throughput parallel workforce crawler and application staging pipeline executing 1,000 concurrent bots."
            }
          ],
          links: {
            github: "github.com/janedoe",
            linkedin: "linkedin.com/in/janedoe"
          },
          evidence: [
            {
              source: "GitHub: Autonomous Task Engine",
              text: "Implemented 1,000 parallel worker swarm with async task queues and 2FA challenge handling."
            }
          ]
        },
        apps: [
          {
            id: "app_live_01",
            jobId: "job_anthropic_01",
            company: "Anthropic Labs",
            role: "Lead AI Systems Engineer",
            match: 97,
            status: "APPLIED",
            verified: true,
            events: [
              { at: new Date().toISOString(), text: "400 Applier Bots staged & submitted with APA 7th verified resume" },
              { at: new Date(Date.now() - 3600000).toISOString(), text: "2FA challenge solved via live prompt handler" }
            ]
          },
          {
            id: "app_live_02",
            jobId: "job_openai_02",
            company: "OpenAI",
            role: "Distributed Systems Architect",
            match: 95,
            status: "INTERVIEW",
            verified: true,
            events: [
              { at: new Date().toISOString(), text: "Interview request received · Notion tracker updated" }
            ]
          },
          {
            id: "app_live_03",
            jobId: "job_stripe_03",
            company: "Stripe",
            role: "Staff Platform Infrastructure Engineer",
            match: 92,
            status: "APPLIED",
            verified: true,
            events: [
              { at: new Date().toISOString(), text: "Custom cover letter generated & APA citations verified" }
            ]
          },
          {
            id: "app_live_04",
            jobId: "job_scale_04",
            company: "Scale AI",
            role: "Senior Full Stack Engineer",
            match: 90,
            status: "READY",
            verified: true,
            events: [
              { at: new Date().toISOString(), text: "Application questions pre-filled by Tailor Agent #412" }
            ]
          },
          {
            id: "app_live_05",
            jobId: "job_vercel_05",
            company: "Vercel",
            role: "Edge Runtime Software Engineer",
            match: 88,
            status: "OFFER",
            verified: true,
            events: [
              { at: new Date().toISOString(), text: "Offer letter stage reached · Notion status synced" }
            ]
          }
        ]
      },
      version: 0
    };
    window.localStorage.setItem('howtolarped_state', JSON.stringify(fullState));
  });
}

async function cleanDevUi(page) {
  await page.addStyleTag({
    content: 'nextjs-portal, [data-nextjs-toast], [data-next-badge] { display: none !important; }'
  });
}

async function recordNotionDemo() {
  console.log('▲ Launching Chrome to record Demo 3 (Applications & Notion Sync)...');
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
    await seedData(page);

    console.log('Navigating to http://localhost:3000/applications...');
    await page.goto('http://localhost:3000/applications', { waitUntil: 'networkidle' });
    await cleanDevUi(page);
    await wait(1800);

    // Smooth scroll down through the applications table
    await smoothScroll(page, 280, 1000);
    await wait(1500);

    // Interactive filter demonstration
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('Anthropic');
      await wait(1500);
      await searchInput.fill('');
      await wait(1000);
    }

    // Hover over an application card/row
    const firstRow = page.locator('table tr, .card, [role="row"]').nth(1);
    if (await firstRow.isVisible()) {
      await firstRow.hover();
      await wait(1200);
    }

    // Scroll back to top
    await smoothScroll(page, 0, 600);
    await wait(800);

    // Navigate to /integrations (Notion Sync)
    console.log('Navigating to http://localhost:3000/integrations...');
    await page.goto('http://localhost:3000/integrations', { waitUntil: 'networkidle' });
    await cleanDevUi(page);
    await wait(1500);

    // Type Notion token
    const tokenInput = page.locator('#nt, input[type="password"], input[placeholder*="secret"]').first();
    if (await tokenInput.isVisible()) {
      await tokenInput.click();
      await tokenInput.fill('secret_notion_prod_agent_tracker_v1');
      await wait(1200);
    }

    // Hover over "1-Click: Self-Create List & Sync All"
    const syncBtn = page.locator('button:has-text("1-Click"), button:has-text("Sync")').first();
    if (await syncBtn.isVisible()) {
      await syncBtn.hover();
      await wait(1500);
    }

    // Smooth scroll to inspect documentation / integration instructions
    await smoothScroll(page, 200, 800);
    await wait(1500);
    await smoothScroll(page, 0, 600);
    await wait(1500);

    await page.close();
    const videoPath = await page.video().path();
    await ctx.close();

    processVideo(videoPath, 'notion-pipeline-demo');
    console.log('✓ Demo 3 recording successfully updated!');
  } finally {
    await browser.close();
    try {
      fs.rmSync(TMP_REC_DIR, { recursive: true, force: true });
    } catch {}
  }
}

recordNotionDemo().catch(console.error);
