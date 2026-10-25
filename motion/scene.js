// Kinetic typography: "Красная цена ей было 50 тысяч..."
// Pure function of time: drawScene(ctx, t) draws the frame at t seconds.
// Motion blur is done in renderFrame() by averaging sub-frame samples.

const W = 1080, H = 1920, FPS = 60, DURATION = 7.6;
const RED = '#E30613', INK = '#0D0D0D', BG = '#FFFFFF';
const MARGIN = 70, COL = W - MARGIN * 2, LBL = 88;
const FAM = { black: 'GPBlack', bold: 'GPBold', medium: 'GPMedium' };

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, t0, d) => clamp((t - t0) / d);
const E = {
  outExpo: k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  inExpo: k => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10)),
  inOutExpo: k => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2),
  outCubic: k => 1 - Math.pow(1 - k, 3),
  inCubic: k => k * k * k,
  inOutCubic: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outQuint: k => 1 - Math.pow(1 - k, 5),
  outBounce: k => {
    const n = 7.5625, d = 2.75;
    if (k < 1 / d) return n * k * k;
    if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75;
    if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375;
    return n * (k -= 2.625 / d) * k + 0.984375;
  },
};
// damped spring 0 -> 1 with overshoot
function spring(t, t0, f = 2.6, z = 0.38) {
  const x = t - t0;
  if (x <= 0) return 0;
  const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x));
}

// ---------- text layout ----------
let ctx;
const font = (weight, size) => `${size}px ${FAM[weight]}`;
function L(txt, weight, size) {
  ctx.font = font(weight, size);
  const offs = [], ws = [];
  for (let i = 0; i < txt.length; i++) {
    offs.push(ctx.measureText(txt.slice(0, i)).width);
    ws.push(ctx.measureText(txt[i]).width);
  }
  const m = ctx.measureText(txt);
  const cap = ctx.measureText('Н').actualBoundingBoxAscent;
  // shift so the ink (not the advance box) starts at x
  return { txt, weight, size, w: m.actualBoundingBoxRight + m.actualBoundingBoxLeft, ink: m.actualBoundingBoxLeft, offs, ws, cap };
}
function fit(txt, weight, width, maxCap = Infinity) {
  const l = L(txt, weight, 100);
  return L(txt, weight, Math.min((100 * width) / l.w, (100 * maxCap) / l.cap));
}

// per-letter draw. o.letter(i, n) -> {dx, dy, s, sx, sy, r, a}
function drawLine(l, x, y, color, o = {}) {
  ctx.save();
  if (o.mask) {
    const p = o.maskPad ?? l.cap * 0.2;
    const mx0 = o.maskTight ? x - 4 : x - 600, mx1 = o.maskTight ? x + l.w + 4 : x + l.w + 600;
    ctx.beginPath();
    ctx.rect(mx0, y - l.cap - p, mx1 - mx0, l.cap + p * 2);
    ctx.clip();
  }
  ctx.font = font(l.weight, l.size);
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  const n = l.txt.length;
  for (let i = 0; i < n; i++) {
    const ch = l.txt[i];
    if (ch === ' ') continue;
    const T = o.letter ? o.letter(i, n) : {};
    const a = T.a ?? 1;
    if (a <= 0.002) continue;
    const s = T.s ?? 1;
    if (s <= 0.001) continue;
    const cx = x + l.ink + l.offs[i] + l.ws[i] / 2, cy = y - l.cap / 2;
    ctx.save();
    ctx.globalAlpha = a * (o.alpha ?? 1);
    ctx.translate(cx + (T.dx || 0), cy + (T.dy || 0));
    if (T.r) ctx.rotate(T.r);
    ctx.scale(s * (T.sx ?? 1), s * (T.sy ?? 1));
    ctx.fillText(ch, -l.ws[i] / 2, l.cap / 2);
    ctx.restore();
  }
  ctx.restore();
}

// transform about an origin
function xf(o, fn) {
  ctx.save();
  ctx.translate((o.ox ?? W / 2) + (o.x || 0), (o.oy ?? H / 2) + (o.y || 0));
  if (o.r) ctx.rotate(o.r);
  const s = o.s ?? 1;
  ctx.scale(s * (o.sx ?? 1), s * (o.sy ?? 1));
  ctx.translate(-(o.ox ?? W / 2), -(o.oy ?? H / 2));
  fn();
  ctx.restore();
}

// common letter animations
const rise = (t, t0, l, stag = 0.03, d = 0.55, dir = 1) => i => {
  const k = E.outExpo(prog(t, t0 + i * stag, d));
  return { dy: (1 - k) * l.cap * 1.6 * dir };
};
const slideIn = (t, t0, dist = 380, stag = 0.028, d = 0.6) => i => {
  const p = prog(t, t0 + i * stag, d);
  return { dx: (1 - E.outExpo(p)) * dist, a: clamp(p * 5) };
};

// ---------- layouts (built once fonts are ready) ----------
let A, B, C, D, F;
function build() {
  A = { l1: fit('КРАСНАЯ', 'black', COL), l2: fit('ЦЕНА', 'black', COL, 350), ei: L('ЕЙ', 'medium', LBL), bylo: L('БЫЛО', 'medium', LBL) };
  B = { num: fit('50', 'black', COL, 560), l2: fit('ТЫСЯЧ', 'black', COL), ne: L('НЕ', 'medium', LBL), bolee: L('БОЛЕЕ', 'medium', LBL) };
  C = { i: L('И', 'bold', 100), l1: fit('ОТДАВАТЬ', 'black', COL, 180) };
  C.ee = L('ЕЁ', 'black', C.l1.size); C.za = L('ЗА', 'black', C.l1.size); C.kop = fit('КОПЕЙКИ', 'black', COL, 250);
  D = { bylo: L('БЫЛО', 'medium', LBL), kap: fit('КАПЕЦ', 'black', COL, 290), kak: L('КАК', 'bold', 124), zh: fit('ЖАЛКО', 'black', COL, 290) };
  const dotsW = 3 * 36 + 2 * 18 + 28;
  F = { l1: fit('ТОГДА', 'black', COL, 330), l2: fit('В ГОЛОВУ', 'black', COL - dotsW, 210) };
  F.v = L('В', 'black', F.l2.size); F.gol = L('ГОЛОВУ', 'black', F.l2.size);
  F.golX = F.l2.offs[2] + F.l2.ink - F.gol.ink;
  F.dotsW = dotsW;
}
const spaceW = (weight, size) => { ctx.font = font(weight, size); return ctx.measureText(' ').width; };

// ---------- scenes ----------
// A: КРАСНАЯ / ЦЕНА / ЕЙ БЫЛО   (0.00 - 1.62)
function sceneA(t) {
  if (t > 1.64) return;
  const { l1, l2, ei, bylo } = A;
  const g = 36, total = l1.cap + g + l2.cap + g * 1.4 + ei.cap;
  const y1 = H / 2 - total / 2 + l1.cap, y2 = y1 + g + l2.cap, y3 = y2 + g * 1.4 + ei.cap;
  const push = 1 + 0.06 * E.outCubic(prog(t, 0.3, 1.3));
  const exit = E.inExpo(prog(t, 1.42, 0.2));
  xf({ s: push, y: -2300 * exit }, () => {
    // red block wipe that turns into the word
    const a = E.inOutCubic(prog(t, 0.04, 0.3)), b = E.inOutExpo(prog(t, 0.33, 0.34));
    const x0 = MARGIN + COL * b, x1 = MARGIN + COL * a;
    if (x1 - x0 > 0.5) {
      ctx.fillStyle = RED;
      ctx.fillRect(x0, y1 - l1.cap - 10, x1 - x0, l1.cap + 20);
    }
    drawLine(l1, MARGIN, y1, RED, { mask: true, letter: rise(t, 0.3, l1, 0.032, 0.6) });
    drawLine(l2, MARGIN, y2, INK, { mask: true, letter: rise(t, 0.8, l2, 0.04, 0.55, -1) });
    drawLine(ei, MARGIN, y3, INK, { mask: true, letter: rise(t, 1.02, ei, 0.03, 0.45) });
    drawLine(bylo, MARGIN + ei.w + spaceW('medium', LBL) + 8, y3, INK, { mask: true, letter: rise(t, 1.24, bylo, 0.03, 0.45) });
  });
}

// B: 50 / ТЫСЯЧ / НЕ БОЛЕЕ   (1.50 - 3.02)
function sceneB(t) {
  if (t < 1.5 || t > 3.04) return;
  const { num, l2, ne, bolee } = B;
  const g = 48, total = num.cap + g + l2.cap + g * 1.2 + ne.cap;
  const y1 = H / 2 - total / 2 + num.cap, y2 = y1 + g + l2.cap, y3 = y2 + g * 1.2 + ne.cap, x2 = MARGIN;
  const enter = 2300 * (1 - E.outExpo(prog(t, 1.52, 0.42)));
  const push = 1 + 0.05 * E.outCubic(prog(t, 1.6, 1.3));
  const ex = E.inExpo(prog(t, 2.8, 0.22));
  xf({ y: enter, s: push * (1 - ex * 0.985), r: -0.012 * prog(t, 1.6, 1.2) - ex * 0.5, oy: H / 2 }, () => {
    // rolling counter, each digit spins and lands on target
    ctx.font = font('black', num.size);
    const step = num.cap * 1.35;
    const cols = [
      { target: 5, t0: 1.5, d: 0.36, spins: 20 },
      { target: 10, t0: 1.54, d: 0.44, spins: 30 },
    ];
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y1 - num.cap - 26, W, num.cap + 52);
    ctx.clip();
    ctx.fillStyle = RED;
    cols.forEach((c, ci) => {
      const cx = MARGIN + num.ink + num.offs[ci] + num.ws[ci] / 2;
      const p = c.target + c.spins * (1 - E.outExpo(prog(t, c.t0, c.d)));
      const k = Math.floor(p);
      for (let j = k - 1; j <= k + 1; j++) {
        const d = ((j % 10) + 10) % 10;
        const dw = ctx.measureText(String(d)).width;
        ctx.fillText(String(d), cx - dw / 2, y1 + (j - p) * step);
      }
    });
    ctx.restore();
    drawLine(l2, x2, y2, INK, { mask: true, maskTight: true, letter: slideIn(t, 1.84, 420, 0.03, 0.6) });
    drawLine(ne, x2, y3, INK, { mask: true, letter: rise(t, 2.31, ne, 0.03, 0.45) });
    drawLine(bolee, x2 + ne.w + spaceW('medium', LBL) + 8, y3, INK, { mask: true, letter: rise(t, 2.42, bolee, 0.03, 0.45) });
    // underline drawn under НЕ БОЛЕЕ
    const u = E.outExpo(prog(t, 2.5, 0.5));
    if (u > 0) {
      ctx.fillStyle = INK;
      ctx.fillRect(x2, y3 + 26, (ne.w + bolee.w + spaceW('medium', LBL) + 8) * u, 8);
    }
  });
}

// C: И / ОТДАВАТЬ / ЕЁ ЗА / КОПЕЙКИ   (2.94 - 4.42)
function sceneC(t) {
  if (t < 2.94 || t > 4.44) return;
  const { i, l1, ee, za, kop } = C;
  const g = 30, total = i.cap + g + l1.cap + g + ee.cap + g * 1.3 + kop.cap;
  const y0 = H / 2 - total / 2 + i.cap, y1 = y0 + g + l1.cap, y2 = y1 + g + ee.cap, y3 = y2 + g * 1.3 + kop.cap;
  const exit = E.inExpo(prog(t, 4.2, 0.2));
  const drift = prog(t, 3.0, 1.4);
  xf({ x: -1500 * exit, s: 1.0 + 0.05 * E.outCubic(drift), r: 0.012 * drift }, () => {
    const sp = spring(t, 2.96, 2.4, 0.42);
    drawLine(i, MARGIN, y0, INK, { letter: () => ({ s: sp, a: clamp(sp * 3) }) });
    drawLine(l1, MARGIN, y1, INK, { mask: true, letter: rise(t, 3.03, l1, 0.026, 0.5) });
    drawLine(ee, MARGIN, y2, INK, { mask: true, letter: rise(t, 3.5, ee, 0.035, 0.45, -1) });
    drawLine(za, MARGIN + ee.w + spaceW('black', ee.size) + 6, y2, INK, { mask: true, maskTight: true, letter: slideIn(t, 3.68, -260, 0.03, 0.45) });
    // coins: letters drop in and bounce
    const rots = [-0.5, 0.35, -0.25, 0.45, -0.4, 0.3, -0.35];
    drawLine(kop, MARGIN, y3, RED, {
      letter: k => {
        const p = prog(t, 3.82 + k * 0.035, 0.62);
        if (p <= 0) return { a: 0 };
        const b = E.outBounce(p);
        return { dy: -(1 - b) * 1100, r: rots[k] * (1 - E.outCubic(p)), a: 1 };
      },
    });
  });
}

// D: БЫЛО / КАПЕЦ / КАК / ЖАЛКО   (4.22 - 6.28)
function sceneD(t) {
  if (t < 4.22 || t > 6.3) return;
  const { bylo, kap, kak, zh } = D;
  const g = 34, total = bylo.cap + g + kap.cap + g * 1.2 + kak.cap + g + zh.cap;
  const y0 = H / 2 - total / 2 + bylo.cap, y1 = y0 + g + kap.cap, y2 = y1 + g * 1.2 + kak.cap, y3 = y2 + g + zh.cap;
  const enter = 1500 * (1 - E.outExpo(prog(t, 4.3, 0.4)));
  // impact shake when КАПЕЦ lands
  const st = t - 4.74;
  const shake = st > 0 ? Math.exp(-st * 9) : 0;
  const sx = shake * 30 * Math.sin(st * 2 * Math.PI * 17), sy = shake * 22 * Math.cos(st * 2 * Math.PI * 13);
  const fall = E.inCubic(prog(t, 6.02, 0.26));
  const pulse = 1 + 0.035 * shake;
  xf({ x: enter + sx, y: sy + 2400 * fall, s: pulse * (1 + 0.04 * prog(t, 4.3, 1.8)), r: 0.004 * shake * Math.sin(st * 60) + 0.12 * fall }, () => {
    drawLine(bylo, MARGIN, y0, INK, { mask: true, letter: rise(t, 4.24, bylo, 0.03, 0.45) });
    const k = E.outExpo(prog(t, 4.62, 0.22));
    const kapS = 1 + 2.4 * (1 - k);
    xf({ s: kapS, ox: MARGIN + kap.w / 2, oy: y1 - kap.cap / 2 }, () => {
      drawLine(kap, MARGIN, y1, INK, { alpha: clamp(prog(t, 4.62, 0.05)) });
    });
    const sp = spring(t, 5.22, 2.6, 0.4);
    drawLine(kak, MARGIN, y2, INK, { letter: () => ({ s: sp, a: clamp(sp * 3) }) });
    // ЖАЛКО: rises, then wilts
    const wilt = E.inOutCubic(prog(t, 5.78, 0.55));
    drawLine(zh, MARGIN, y3, RED, {
      mask: wilt <= 0, letter: j => {
        const r = rise(t, 5.44, zh, 0.035, 0.5)(j);
        return { dy: r.dy + wilt * (6 + 24 * j), r: wilt * 0.038 * j, sy: 1 - 0.05 * wilt };
      },
    });
  });
}

// F: ТОГДА / В ГОЛОВУ ...   (6.12 - end)
function sceneF(t) {
  if (t < 6.1) return;
  const { l1, v, gol } = F;
  const g = 40, total = l1.cap + g + v.cap;
  const y1 = H / 2 - total / 2 + l1.cap, y2 = y1 + g + v.cap;
  const enter = -2400 * (1 - E.outExpo(prog(t, 6.14, 0.42)));
  xf({ y: enter, s: 1 + 0.05 * E.outCubic(prog(t, 6.2, 1.4)) }, () => {
    drawLine(l1, MARGIN, y1, INK, { mask: true, maskTight: true, letter: slideIn(t, 6.17, 420, 0.03, 0.55) });
    const sv = spring(t, 6.47, 2.6, 0.4);
    drawLine(v, MARGIN, y2, INK, { letter: () => ({ s: sv, a: clamp(sv * 3) }) });
    drawLine(gol, MARGIN + F.golX, y2, INK, { mask: true, letter: rise(t, 6.55, gol, 0.03, 0.5) });
    // three red dots
    const dx0 = MARGIN + F.golX + gol.w + 28, r = 18;
    for (let k = 0; k < 3; k++) {
      const s = spring(t, 6.98 + k * 0.12, 3.0, 0.35);
      if (s <= 0) continue;
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(dx0 + r + k * (2 * r + 18), y2 - r, r * Math.max(0, s), 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawScene(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  sceneA(t);
  sceneB(t);
  sceneC(t);
  sceneD(t);
  sceneF(t);
}

// ---------- frame rendering with motion blur ----------
let cv, out, octx, acc;
async function init() {
  const faces = [['GPBlack', 'GothamPro-Black.otf'], ['GPBold', 'GothamPro-Bold.otf'], ['GPMedium', 'GothamPro-Medium.otf']];
  for (const [name, file] of faces) {
    const f = new FontFace(name, `url(fonts/${file})`);
    await f.load();
    document.fonts.add(f);
  }
  cv = document.getElementById('c');
  cv.width = W; cv.height = H;
  ctx = cv.getContext('2d', { willReadFrequently: true });
  out = document.createElement('canvas');
  out.width = W; out.height = H;
  octx = out.getContext('2d');
  acc = new Float32Array(W * H * 3);
  build();
  return { W, H, FPS, frames: Math.round(DURATION * FPS) };
}

// samples sub-frames across a shutter of `shutter` frames, centered on the frame
async function renderFrame(f, samples = 48, shutter = 0.6) {
  const t = f / FPS;
  acc.fill(0);
  for (let k = 0; k < samples; k++) {
    const ts = t + ((k + 0.5) / samples - 0.5) * (shutter / FPS);
    drawScene(ts);
    const d = ctx.getImageData(0, 0, W, H).data;
    for (let p = 0, q = 0; p < d.length; p += 4, q += 3) {
      acc[q] += d[p]; acc[q + 1] += d[p + 1]; acc[q + 2] += d[p + 2];
    }
  }
  const img = octx.createImageData(W, H), o = img.data, inv = 1 / samples;
  for (let p = 0, q = 0; p < o.length; p += 4, q += 3) {
    o[p] = acc[q] * inv + 0.5; o[p + 1] = acc[q + 1] * inv + 0.5; o[p + 2] = acc[q + 2] * inv + 0.5; o[p + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  const blob = await new Promise(r => out.toBlob(r, 'image/png'));
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(s);
}
