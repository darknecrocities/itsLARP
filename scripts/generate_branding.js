const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PUBLIC_DIR = path.resolve(__dirname, '../apps/web/public');
const APP_DIR = path.resolve(__dirname, '../apps/web/app');
const BRANDING_DIR = path.join(PUBLIC_DIR, 'branding');

if (!fs.existsSync(BRANDING_DIR)) {
  fs.mkdirSync(BRANDING_DIR, { recursive: true });
}

// 1. Sleek Minimalist App Icon / Mark SVG (512x512)
const appIconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#121215" />
      <stop offset="100%" stop-color="#050507" />
    </linearGradient>
    <linearGradient id="glyphGrad" x1="120" y1="120" x2="380" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E4E4E7" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="320" y1="120" x2="400" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Base Squircle with hairline border -->
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#bgGrad)" filter="url(#subtleGlow)" />
  <rect x="16.5" y="16.5" width="479" height="479" rx="111.5" stroke="#27272A" stroke-width="1.5" />

  <!-- Background precision grid pattern (subtle architectural lines) -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
    <line x1="96" y1="96" x2="416" y2="96" />
    <line x1="96" y1="176" x2="416" y2="176" />
    <line x1="96" y1="256" x2="416" y2="256" />
    <line x1="96" y1="336" x2="416" y2="336" />
    <line x1="96" y1="416" x2="416" y2="416" />
    <line x1="96" y1="96" x2="96" y2="416" />
    <line x1="176" y1="96" x2="176" y2="416" />
    <line x1="256" y1="96" x2="256" y2="416" />
    <line x1="336" y1="96" x2="336" y2="416" />
    <line x1="416" y1="96" x2="416" y2="416" />
  </g>

  <!-- Core Glyph: Precision Geometric "L" + Ascending Vector Arrow -->
  <!-- Vertical Stem & Horizontal Base -->
  <path d="M144 144 C144 135.163 151.163 128 160 128 H212 C220.837 128 228 135.163 228 144 V300 H352 C360.837 300 368 307.163 368 316 V368 C368 376.837 360.837 384 352 384 H160 C151.163 384 144 376.837 144 368 V144 Z" fill="url(#glyphGrad)" />

  <!-- Autonomous Forward Ray / Vector Wedge (Ascending Arrow Symbolizing Job Applications & Swarm Launch) -->
  <path d="M268 244 L368 144 M368 144 H296 M368 144 V216" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Radar Status Pulse / Swarm Beacon (Active Emerald Dot) -->
  <circle cx="384" cy="128" r="14" fill="url(#accentGrad)" />
  <circle cx="384" cy="128" r="22" stroke="#10B981" stroke-width="2" opacity="0.4" />

  <!-- Precision Orbit Nodes (Representing 3 Swarm Pools: 300 Scrapers, 300 Tailors, 400 Appliers) -->
  <circle cx="228" cy="192" r="5" fill="#09090B" />
  <circle cx="228" cy="248" r="5" fill="#09090B" />
  <circle cx="292" cy="342" r="5" fill="#09090B" />
</svg>`;

// 2. Standalone Transparent Mark SVG
const markDarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="10" fill="#09090B" />
  <rect x="0.5" y="0.5" width="47" height="47" rx="9.5" stroke="#27272A" stroke-width="1" />
  <path d="M14 14 H20 V28 H34 V34 H14 V14 Z" fill="#FFFFFF" />
  <path d="M25 23 L34 14 M34 14 H28 M34 14 V20" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="35" cy="13" r="2.5" fill="#10B981" />
</svg>`;

// 3. Standalone Light Mode Mark
const markLightSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="10" fill="#FFFFFF" />
  <rect x="0.5" y="0.5" width="47" height="47" rx="9.5" stroke="#E4E4E7" stroke-width="1" />
  <path d="M14 14 H20 V28 H34 V34 H14 V14 Z" fill="#09090B" />
  <path d="M25 23 L34 14 M34 14 H28 M34 14 V20" stroke="#09090B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="35" cy="13" r="2.5" fill="#10B981" />
</svg>`;

// 4. Horizontal Full Brand Logo (Icon + Typography: "itsLARP" + "CAREER OS")
const logoFullSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="240" height="48" viewBox="0 0 240 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="4" width="40" height="40" rx="9" fill="#09090B" />
  <rect x="2.5" y="4.5" width="39" height="39" rx="8.5" stroke="#27272A" stroke-width="1" />
  <path d="M13 13 H18 V25 H31 V30 H13 V13 Z" fill="#FFFFFF" />
  <path d="M23 21 L31 13 M31 13 H26 M31 13 V18" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="32" cy="12" r="2" fill="#10B981" />

  <text x="52" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Space Grotesk', Inter, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.03em" fill="#09090B">
    its<tspan font-weight="800">LARP</tspan>
  </text>
  <rect x="144" y="14" width="46" height="18" rx="4" fill="#09090B" />
  <text x="167" y="26.5" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.06em">
    OS v1.0
  </text>
  <text x="52" y="38" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="500" letter-spacing="0.08em" fill="#71717A">
    AI JOB-HUNTING WORKFORCE
  </text>
</svg>`;

// 5. Dark Background Variant of Full Logo
const logoFullWhiteSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="240" height="48" viewBox="0 0 240 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="4" width="40" height="40" rx="9" fill="#FFFFFF" />
  <path d="M13 13 H18 V25 H31 V30 H13 V13 Z" fill="#09090B" />
  <path d="M23 21 L31 13 M31 13 H26 M31 13 V18" stroke="#09090B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="32" cy="12" r="2" fill="#10B981" />

  <text x="52" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Space Grotesk', Inter, sans-serif" font-size="20" font-weight="700" letter-spacing="-0.03em" fill="#FFFFFF">
    its<tspan font-weight="800">LARP</tspan>
  </text>
  <rect x="144" y="14" width="46" height="18" rx="4" fill="#27272A" />
  <text x="167" y="26.5" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.06em">
    OS v1.0
  </text>
  <text x="52" y="38" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="500" letter-spacing="0.08em" fill="#A1A1AA">
    AI JOB-HUNTING WORKFORCE
  </text>
</svg>`;

// 6. Minimalistic Favicon SVG (Super bold and crisp for browser tabs at 16x16 / 32x32)
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="7" fill="#09090B" />
  <path d="M9 8 H14 V19 H23 V24 H9 V8 Z" fill="#FFFFFF" />
  <path d="M17 15 L23 9 M23 9 H18 M23 9 V14" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="24.5" cy="7.5" r="2" fill="#10B981" />
</svg>`;

// Write all SVGs
fs.writeFileSync(path.join(BRANDING_DIR, 'logo-mark.svg'), appIconSvg);
fs.writeFileSync(path.join(BRANDING_DIR, 'logo-mark-dark.svg'), markDarkSvg);
fs.writeFileSync(path.join(BRANDING_DIR, 'logo-mark-light.svg'), markLightSvg);
fs.writeFileSync(path.join(BRANDING_DIR, 'logo-full.svg'), logoFullSvg);
fs.writeFileSync(path.join(BRANDING_DIR, 'logo-full-white.svg'), logoFullWhiteSvg);
fs.writeFileSync(path.join(BRANDING_DIR, 'favicon.svg'), faviconSvg);

// Write to public/icon.svg and app/icon.svg for Next.js automatic icon discovery
fs.writeFileSync(path.join(PUBLIC_DIR, 'icon.svg'), faviconSvg);
fs.writeFileSync(path.join(APP_DIR, 'icon.svg'), faviconSvg);

console.log('[OK] Vector SVG branding assets written successfully.');

// Rasterize using Playwright
async function rasterize() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Render 512x512 Master App Icon
    await page.setViewportSize({ width: 512, height: 512 });
    await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;display:flex;align-items:center;justify-content:center;width:512px;height:512px;">' + appIconSvg + '</body></html>');
    const masterPngPath = path.join(BRANDING_DIR, 'icon-512.png');
    await page.screenshot({ path: masterPngPath, omitBackground: true });
    fs.copyFileSync(masterPngPath, path.join(PUBLIC_DIR, 'icon-512.png'));
    console.log('[OK] Master icon 512x512 rendered.');

    // Render 192x192 Web App Manifest Icon
    await page.setViewportSize({ width: 192, height: 192 });
    await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:192px;height:192px;"><div style="width:192px;height:192px;">' + appIconSvg.replace('width="512" height="512"', 'width="192" height="192"') + '</div></body></html>');
    const icon192Path = path.join(PUBLIC_DIR, 'icon-192.png');
    await page.screenshot({ path: icon192Path, omitBackground: true });
    fs.copyFileSync(icon192Path, path.join(BRANDING_DIR, 'icon-192.png'));
    console.log('[OK] Icon 192x192 rendered.');

    // Render 180x180 Apple Touch Icon
    await page.setViewportSize({ width: 180, height: 180 });
    await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:180px;height:180px;"><div style="width:180px;height:180px;">' + appIconSvg.replace('width="512" height="512"', 'width="180" height="180"') + '</div></body></html>');
    const appleIconPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
    await page.screenshot({ path: appleIconPath, omitBackground: true });
    fs.copyFileSync(appleIconPath, path.join(APP_DIR, 'apple-icon.png'));
    fs.copyFileSync(appleIconPath, path.join(BRANDING_DIR, 'apple-touch-icon.png'));
    console.log('[OK] Apple touch icon 180x180 rendered.');

    // Render 32x32 Favicon PNG
    await page.setViewportSize({ width: 32, height: 32 });
    await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:32px;height:32px;">' + faviconSvg + '</body></html>');
    const favicon32Path = path.join(BRANDING_DIR, 'favicon-32.png');
    await page.screenshot({ path: favicon32Path, omitBackground: true });
    console.log('[OK] Favicon 32x32 rendered.');

    // Render 16x16 Favicon PNG
    await page.setViewportSize({ width: 16, height: 16 });
    await page.setContent('<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:16px;height:16px;">' + faviconSvg.replace('width="32" height="32"', 'width="16" height="16"') + '</body></html>');
    const favicon16Path = path.join(BRANDING_DIR, 'favicon-16.png');
    await page.screenshot({ path: favicon16Path, omitBackground: true });
    console.log('[OK] Favicon 16x16 rendered.');

    // Render OpenGraph Preview Card (1200x630)
    await page.setViewportSize({ width: 1200, height: 630 });
    const ogHtml = `<!DOCTYPE html>
<html>
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  </head>
  <body style="margin: 0; padding: 0; background: #09090B; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif; width: 1200px; height: 630px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 64px; position: relative; overflow: hidden;">
    <div style="position: absolute; inset: 0; opacity: 0.08; background-image: linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px); background-size: 48px 48px;"></div>
    <div style="position: absolute; top: -100px; right: -100px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%); pointer-events: none;"></div>

    <div style="position: relative; z-index: 10; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="width: 56px; height: 56px;">
          ${appIconSvg.replace('width="512" height="512"', 'width="56" height="56"')}
        </div>
        <span style="font-size: 32px; font-weight: 800; letter-spacing: -0.03em;">its<span style="color: #FFFFFF;">LARP</span></span>
        <span style="background: #27272A; border: 1px solid #3F3F46; border-radius: 6px; padding: 4px 10px; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #10B981;">v1.0 OS</span>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #71717A; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></span>
        1,000 ACTIVE AGENTS READY
      </div>
    </div>

    <div style="position: relative; z-index: 10; margin-top: 40px;">
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #10B981; letter-spacing: 0.12em; margin-bottom: 12px; font-weight: 700;">
        THE AUTONOMOUS CAREER OPERATING SYSTEM
      </div>
      <h1 style="font-size: 58px; font-weight: 800; line-height: 1.08; letter-spacing: -0.03em; margin: 0; max-width: 960px;">
        Your AI Job-Hunting Workforce. No Manual Applications Needed.
      </h1>
      <p style="font-size: 20px; color: #A1A1AA; line-height: 1.5; margin: 20px 0 0 0; max-width: 800px;">
        Upload your resume once. 300 Discovery Crawlers find roles, 300 Tailors build custom APA 7th resumes with 0% hallucinations, and 400 Appliers stage submissions with 1-click Notion sync.
      </p>
    </div>

    <div style="position: relative; z-index: 10; display: flex; gap: 24px; border-top: 1px solid #27272A; padding-top: 28px;">
      <div style="flex: 1; border-left: 2px solid #10B981; padding-left: 14px;">
        <div style="font-size: 24px; font-weight: 800;">300 Bots</div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #71717A; margin-top: 2px;">LinkedIn & JobStreet Crawlers</div>
      </div>
      <div style="flex: 1; border-left: 2px solid #3B82F6; padding-left: 14px;">
        <div style="font-size: 24px; font-weight: 800;">APA 7th</div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #71717A; margin-top: 2px;">Academic-Grade Resumes</div>
      </div>
      <div style="flex: 1; border-left: 2px solid #8B5CF6; padding-left: 14px;">
        <div style="font-size: 24px; font-weight: 800;">400 Appliers</div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #71717A; margin-top: 2px;">Form Autofill & Staging</div>
      </div>
      <div style="flex: 1; border-left: 2px solid #F59E0B; padding-left: 14px;">
        <div style="font-size: 24px; font-weight: 800;">1-Click Notion</div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #71717A; margin-top: 2px;">Auto-List Application Mirror</div>
      </div>
    </div>
  </body>
</html>`;

    await page.setContent(ogHtml);
    // Give fonts a moment to render
    await page.waitForTimeout(600);
    const ogCardPath = path.join(BRANDING_DIR, 'og-card.png');
    await page.screenshot({ path: ogCardPath });
    fs.copyFileSync(ogCardPath, path.join(PUBLIC_DIR, 'og-card.png'));
    console.log('[OK] OpenGraph 1200x630 card rendered.');

  } finally {
    await browser.close();
  }
}

rasterize().catch(console.error);
