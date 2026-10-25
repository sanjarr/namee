// Renders index.html frame by frame (headless Chromium) and muxes with voice.wav.
// usage: node render.js [--preview t1,t2,...] [--workers N] [--samples N]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = path.join(__dirname, 'out');
const FRAMES = path.join(OUT, 'frames');

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const url = 'file://' + path.join(__dirname, 'index.html');
  const open = async () => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', e => console.error('page error:', e));
    await page.goto(url);
    const info = await page.evaluate(() => init());
    return { page, info };
  };

  const preview = opt('--preview');
  if (preview) {
    const { page, info } = await open();
    for (const t of preview.split(',').map(Number)) {
      const b64 = await page.evaluate(([f]) => renderFrame(f, 8), [Math.round(t * info.FPS)]);
      fs.writeFileSync(path.join(OUT, `preview_${t.toFixed(2)}.png`), Buffer.from(b64, 'base64'));
    }
    await browser.close();
    return;
  }

  const workers = +opt('--workers', 4), samples = +opt('--samples', 48);
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  const pages = await Promise.all(Array.from({ length: workers }, open));
  const total = pages[0].info.frames;
  let next = 0, done = 0;
  const t0 = Date.now();
  await Promise.all(pages.map(async ({ page }) => {
    while (next < total) {
      const f = next++;
      const b64 = await page.evaluate(([f, s]) => renderFrame(f, s), [f, samples]);
      fs.writeFileSync(path.join(FRAMES, `f${String(f).padStart(4, '0')}.png`), Buffer.from(b64, 'base64'));
      if (++done % 30 === 0) console.log(`${done}/${total} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }));
  await browser.close();

  const dur = (total / 60).toFixed(4);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '60', '-i', path.join(FRAMES, 'f%04d.png'),
    '-i', path.join(__dirname, 'voice.wav'), '-af', 'apad', '-t', dur,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', '60',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', path.join(OUT, 'kinetic_typography_60fps.mp4')], { stdio: 'inherit' });
  console.log('done:', path.join(OUT, 'kinetic_typography_60fps.mp4'));
})();
