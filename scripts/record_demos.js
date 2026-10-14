const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const PUBLIC_DEMOS_DIR = path.resolve(__dirname, '../apps/web/public/demos');
const TMP_REC_DIR = path.resolve(__dirname, '../.recordings_tmp');

if (!fs.existsSync(PUBLIC_DEMOS_DIR)) {
  fs.mkdirSync(PUBLIC_DEMOS_DIR, { recursive: true });
}
if (!fs.existsSync(TMP_REC_DIR)) {
  fs.mkdirSync(TMP_REC_DIR, { recursive: true });
}

// Helper to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Smooth human-like scroll helper
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
          // Ease in-out cubic
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

// Convert webm to web-optimized mp4 and extract poster
function processVideo(rawWebmPath, baseName) {
  const mp4Path = path.join(PUBLIC_DEMOS_DIR, `${baseName}.mp4`);
  const webmPath = path.join(PUBLIC_DEMOS_DIR, `${baseName}.webm`);
  const posterPath = path.join(PUBLIC_DEMOS_DIR, `${baseName}-poster.jpg`);

  console.log(`\nEncoding ${baseName} with ffmpeg...`);

  // Fast, high-quality H.264 MP4 with faststart flag for instant web streaming
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -i "${rawWebmPath}" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -movflags +faststart -an "${mp4Path}"`,
    { stdio: 'inherit' }
  );

  // WebM version for modern browsers
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -i "${rawWebmPath}" -c:v libvpx-vp9 -b:v 1200k -crf 32 -an "${webmPath}"`,
    { stdio: 'inherit' }
  );

  // Extract poster frame from second 2
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -ss 00:00:02 -i "${mp4Path}" -vframes 1 -q:v 2 "${posterPath}"`,
    { stdio: 'inherit' }
  );

  console.log(`[OK] Generated ${baseName}.mp4, ${baseName}.webm, and ${baseName}-poster.jpg`);
}

// Helper to seed rich career profile into localStorage
async function seedProfile(page) {
  await page.addInitScript(() => {
    const profileState = {
      state: {
        profile: {
          name: "Jane Doe",
          headline: "Lead AI Systems & Full Stack Engineer",
          email: "jane.doe@example.com",
          location: "San Francisco, CA (Remote)",
          years: 5,
          skills: [
            "Python",
            "FastAPI",
            "React",
            "TypeScript",
            "Docker",
            "PostgreSQL",
            "PyTorch",
            "Tailwind CSS"
          ],
          education: "Bachelor of Science in Computer Science, Stanford University",
          experience: [
            {
              company: "Anthropic Labs",
              title: "Senior AI Systems Engineer",
              text: "Architected distributed agent runtime executing 100,000+ autonomous parallel tasks with verifiable zero-hallucination gates."
            },
            {
              company: "FinTech Scale",
              title: "Full Stack Engineer",
              text: "Engineered real-time reactive event pipelines in TypeScript, Next.js, and Postgres."
            }
          ],
          projects: [
            {
              name: "Autonomous Task Engine",
              tech: ["Python", "FastAPI", "React", "Docker"],
              text: "High-throughput parallel workforce crawler and application staging pipeline executing 1,000 concurrent bots."
            },
            {
              name: "Career DNA Synthesizer",
              tech: ["Python", "PostgreSQL", "PyTorch"],
              text: "Structured citation and evidence extraction compiler adhering to APA 7th publication standards."
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
            },
            {
              source: "Verified APA Repository",
              text: "0% hallucination verification gate preventing exaggeration or fabrication of skills."
            }
          ]
        }
      },
      version: 0
    };
    window.localStorage.setItem('howtolarped_state', JSON.stringify(profileState));
  });
}

// Hide Next.js dev toast indicator in clean demo recordings
async function cleanDevUi(page) {
  await page.addStyleTag({
    content: 'nextjs-portal, [data-nextjs-toast], [data-next-badge] { display: none !important; }'
  });
}

async function runRecordings() {
  console.log('▲ Launching Google Chrome for real application demo recordings...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  try {
    // ----------------------------------------------------
    // DEMO 1: The 1,000-Bot Workforce Swarm in Action
    // Accurately showcases Section 1 (Live Workforce Network)
    // ----------------------------------------------------
    console.log('\n[1/3] Recording Demo 1: Workforce Swarm in Real-Time...');
    const ctx1 = await browser.newContext({
      recordVideo: {
        dir: TMP_REC_DIR,
        size: { width: 1280, height: 720 },
      },
      viewport: { width: 1280, height: 720 },
    });
    const page1 = await ctx1.newPage();
    await seedProfile(page1);

    // Visit Landing page live workforce section
    await page1.goto('http://localhost:3000/#workforce-demo', { waitUntil: 'networkidle' });
    await cleanDevUi(page1);
    await wait(1000);

    // Scroll smoothly to the live interactive demo section
    await smoothScroll(page1, 640, 1000);
    await wait(1200);

    // Click "Interactive Agent Network" tab
    const pipelineBtn = page1.locator('button:has-text("Interactive Agent Network")');
    if (await pipelineBtn.isVisible()) {
      await pipelineBtn.click();
      await wait(1500);
    }

    // Toggle Pause / Resume Demo to show interactive capability
    const pauseBtn = page1.locator('button:has-text("Pause Demo")');
    if (await pauseBtn.isVisible()) {
      await pauseBtn.hover();
      await wait(600);
      await pauseBtn.click();
      await wait(1000);
      const resumeBtn = page1.locator('button:has-text("Resume Demo")');
      if (await resumeBtn.isVisible()) {
        await resumeBtn.click();
        await wait(1000);
      }
    }

    // Switch to Sample APA Resume tab
    const apaTabBtn = page1.locator('button:has-text("Sample APA Resume")');
    if (await apaTabBtn.isVisible()) {
      await apaTabBtn.click();
      await wait(1500);
    }

    // Switch to Notion Application List tab
    const notionTabBtn = page1.locator('button:has-text("Notion Application List")');
    if (await notionTabBtn.isVisible()) {
      await notionTabBtn.click();
      await wait(1500);
    }

    // Navigate to the deep /agents console
    await page1.goto('http://localhost:3000/agents', { waitUntil: 'networkidle' });
    await cleanDevUi(page1);
    await wait(1200);

    // Launch Swarm simulation / interact with agent filters
    const launchBtn = page1.locator('button:has-text("Launch 1,000 Agents")');
    if (await launchBtn.isVisible()) {
      await launchBtn.hover();
      await wait(500);
      await launchBtn.click();
      await wait(2500);
    }

    // Scroll down to view the active swarm matrix & logs
    await smoothScroll(page1, 400, 800);
    await wait(2000);

    // Filter to Tailors or Appliers tab if available
    const stagesTab = page1.locator('button:has-text("Pipeline Stages")');
    if (await stagesTab.isVisible()) {
      await stagesTab.click();
      await wait(1500);
    }

    await wait(1500);
    await page1.close();
    const video1Path = await page1.video().path();
    await ctx1.close();
    processVideo(video1Path, 'workforce-swarm-demo');

    // ----------------------------------------------------
    // DEMO 2: APA 7th Edition Resume Studio & Tailoring
    // Accurately showcases Section 2 (APA Resume Engine)
    // ----------------------------------------------------
    console.log('\n[2/3] Recording Demo 2: APA 7th Edition Resume Studio...');
    const ctx2 = await browser.newContext({
      recordVideo: {
        dir: TMP_REC_DIR,
        size: { width: 1280, height: 720 },
      },
      viewport: { width: 1280, height: 720 },
    });
    const page2 = await ctx2.newPage();
    await seedProfile(page2);

    // Visit /resume page
    await page2.goto('http://localhost:3000/resume', { waitUntil: 'networkidle' });
    await cleanDevUi(page2);
    await wait(1200);

    // Scroll down slowly through the academic APA 7th formatted resume
    await smoothScroll(page2, 350, 1200);
    await wait(1800);

    // Hover over the verified software citations section
    const citationSection = page2.locator('text=Software Artifacts');
    if (await citationSection.isVisible()) {
      await citationSection.hover();
      await wait(1000);
    }

    // Scroll down to see Verifiable Evidence Corpus
    await smoothScroll(page2, 650, 1200);
    await wait(1800);

    // Scroll back to top
    await smoothScroll(page2, 0, 800);
    await wait(1000);

    // Test format toggle or download button hover
    const standardBtn = page2.locator('button:has-text("Standard View"), button:has-text("ATS Clean")');
    if (await standardBtn.isVisible()) {
      await standardBtn.click();
      await wait(1200);
      const apaBtn = page2.locator('button:has-text("APA 7th Format")');
      if (await apaBtn.isVisible()) {
        await apaBtn.click();
        await wait(1200);
      }
    }

    // Hover over Download APA button
    const downloadBtn = page2.locator('button:has-text("Download APA (.txt)")');
    if (await downloadBtn.isVisible()) {
      await downloadBtn.hover();
      await wait(1000);
    }

    // Click "Tailor for a Job" button
    const tailorBtn = page2.locator('a:has-text("Tailor for a Job")');
    if (await tailorBtn.isVisible()) {
      await tailorBtn.click();
      await page2.waitForURL('**/jobs', { timeout: 4000 }).catch(() => {});
      await cleanDevUi(page2);
      await wait(2000);

      // Select a job to view match breakdown
      const jobCard = page2.locator('.card').first();
      if (await jobCard.isVisible()) {
        await jobCard.hover();
        await wait(1200);
      }
    }

    await wait(1500);
    await page2.close();
    const video2Path = await page2.video().path();
    await ctx2.close();
    processVideo(video2Path, 'apa-resume-demo');

    // ----------------------------------------------------
    // DEMO 3: Applications Pipeline & 1-Click Notion Tracker
    // Accurately showcases Section 3 (Applications & Notion Sync)
    // ----------------------------------------------------
    console.log('\n[3/3] Recording Demo 3: Applications Pipeline & Notion Sync...');
    const ctx3 = await browser.newContext({
      recordVideo: {
        dir: TMP_REC_DIR,
        size: { width: 1280, height: 720 },
      },
      viewport: { width: 1280, height: 720 },
    });
    const page3 = await ctx3.newPage();
    await seedProfile(page3);

    // Visit /applications page
    await page3.goto('http://localhost:3000/applications', { waitUntil: 'networkidle' });
    await cleanDevUi(page3);
    await wait(1200);

    // Scroll through applications pipeline
    await smoothScroll(page3, 200, 800);
    await wait(1200);

    // Search filter demo
    const searchInput = page3.locator('input[placeholder*="Search"], input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('Frontend');
      await wait(1200);
      await searchInput.fill('');
      await wait(800);
    }

    // Navigate to /integrations page
    await page3.goto('http://localhost:3000/integrations', { waitUntil: 'networkidle' });
    await cleanDevUi(page3);
    await wait(1200);

    // Smooth scroll through Notion auto-list configuration
    await smoothScroll(page3, 200, 800);
    await wait(1000);

    // Fill Notion token demo and interact
    const tokenInput = page3.locator('#nt, input[type="password"]');
    if (await tokenInput.isVisible()) {
      await tokenInput.click();
      await tokenInput.fill('secret_notion_auto_sync_token');
      await wait(1000);
    }

    // Hover over the Auto-Create & Sync Database button
    const syncBtn = page3.locator('button:has-text("Auto-Create Database"), button:has-text("Connect")').first();
    if (await syncBtn.isVisible()) {
      await syncBtn.hover();
      await wait(1000);
    }

    // Smooth scroll back up to show Notion feature highlights
    await smoothScroll(page3, 0, 800);
    await wait(2000);

    await page3.close();
    const video3Path = await page3.video().path();
    await ctx3.close();
    processVideo(video3Path, 'notion-pipeline-demo');

    console.log('\n======================================================');
    console.log('[OK] All 3 Real Application Demos successfully recorded!');
    console.log('  1. workforce-swarm-demo.mp4 (Swarm & 1,000 Agents)');
    console.log('  2. apa-resume-demo.mp4 (APA 7th Resume Engine)');
    console.log('  3. notion-pipeline-demo.mp4 (Applications & Notion Sync)');
    console.log('======================================================\n');
  } finally {
    await browser.close();
    try {
      fs.rmSync(TMP_REC_DIR, { recursive: true, force: true });
    } catch {}
  }
}

runRecordings().catch(console.error);
