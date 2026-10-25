// Kinetic typography, part 2: "Тогда в голову пришла безумная мысль..." (erlan_1.wav)
// Data-driven: SCRIPT is a list of screens, each screen is lines of timed words with an effect.
// Chroma-key green background so the text can be keyed over footage.

const W = 1080, H = 1920, FPS = 60, DURATION = 38.6;
const RED = '#E30613', INK = '#FFFFFF', BG = '#00FF00';
const MARGIN = 130, COL = W - MARGIN * 2;
const FAM = { black: 'GPBlack', bold: 'GPBold', medium: 'GPMedium' };
// size classes: weight + max cap height (lines are also fitted to the column width)
const SIZE = { xxl: ['black', 430], xl: ['black', 250], l: ['black', 165], m: ['black', 105], s: ['medium', 58] };

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, t0, d) => clamp((t - t0) / d);
const E = {
  outExpo: k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  inExpo: k => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10)),
  outCubic: k => 1 - Math.pow(1 - k, 3),
  inCubic: k => k * k * k,
  inOutCubic: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outBounce: k => {
    const n = 7.5625, d = 2.75;
    if (k < 1 / d) return n * k * k;
    if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75;
    if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375;
    return n * (k -= 2.625 / d) * k + 0.984375;
  },
};
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
  return { txt, weight, size, w: m.actualBoundingBoxRight + m.actualBoundingBoxLeft, ink: m.actualBoundingBoxLeft, offs, ws, cap };
}
function fit(txt, weight, width, maxCap = Infinity) {
  const l = L(txt, weight, 100);
  return L(txt, weight, Math.min((100 * width) / l.w, (100 * maxCap) / l.cap));
}

function drawLine(l, x, y, color, o = {}) {
  ctx.save();
  if (o.mask) {
    const p = l.cap * 0.22;
    const mx0 = o.maskTight ? x - 4 : x - 700, mx1 = o.maskTight ? x + l.w + 4 : x + l.w + 700;
    ctx.beginPath();
    ctx.rect(mx0, y - l.cap - p, mx1 - mx0, l.cap + p * 2);
    ctx.clip();
  }
  ctx.font = font(l.weight, l.size);
  ctx.fillStyle = color;
  const n = l.txt.length;
  for (let i = 0; i < n; i++) {
    const ch = l.txt[i];
    if (ch === ' ') continue;
    const T = o.letter ? o.letter(i, n) : {};
    const a = (T.a ?? 1) * (o.alpha ?? 1);
    const s = T.s ?? 1;
    if (a <= 0.002 || s <= 0.001) continue;
    const cx = x + l.ink + l.offs[i] + l.ws[i] / 2, cy = y - l.cap / 2;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(cx + (T.dx || 0), cy + (T.dy || 0));
    if (T.r) ctx.rotate(T.r);
    ctx.scale(s * (T.sx ?? 1), s * (T.sy ?? 1));
    ctx.fillText(ch, -l.ws[i] / 2, l.cap / 2);
    ctx.restore();
  }
  ctx.restore();
}

function xf(o, fn) {
  ctx.save();
  const ox = o.ox ?? W / 2, oy = o.oy ?? H / 2;
  ctx.translate(ox + (o.x || 0), oy + (o.y || 0));
  if (o.r) ctx.rotate(o.r);
  const s = o.s ?? 1;
  ctx.scale(s, s);
  ctx.translate(-ox, -oy);
  fn();
  ctx.restore();
}

const rise = (t, t0, l, stag = 0.028, d = 0.5, dir = 1) => i => ({ dy: (1 - E.outExpo(prog(t, t0 + i * stag, d))) * l.cap * 1.6 * dir });
const hash = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- script ----------
// w(text, time, effect, red)
const w = (txt, t, fx = 'rise', red = false) => ({ txt, t, fx, red });
const R = (txt, t, fx = 'rise') => w(txt, t, fx, true);
const SCRIPT = [
  { out: 'left', lines: [['l', w('ТОГДА', 0.31)], ['m', w('В', 0.48, 'pop'), w('ГОЛОВУ', 0.66)], ['s', w('ПРИШЛА', 1.06)], ['xl', R('БЕЗУМНАЯ', 1.32, 'crazy')], ['l', w('МЫСЛЬ', 1.78, 'drop')]] },
  { out: 'up', lines: [['m', w('А', 2.4, 'pop'), w('ЧТО', 2.5), w('ЕСЛИ', 2.66)], ['xl', R('РИСКНУТЬ?', 2.9, 'slam')]] },
  { out: 'left', lines: [['l', w('ВЛОЖИТЬ', 3.62)], ['xl', w('ДЕНЬГИ', 3.88, 'drop')], ['m', w('И', 4.22, 'pop'), w('ПЕРЕДЕЛАТЬ', 4.5)], ['l', w('ВСЁ', 5.1, 'slide')], ['xl', R('ПОД', 5.3), R('КЛЮЧ', 5.56, 'slam')]] },
  { out: 'up', lines: [['m', w('И', 5.72, 'pop')], ['xl', R('УПАКОВАТЬ', 6.06, 'box')]] },
  { out: 'right', lines: [['s', w('ВСЕ', 7.42), w('ВОКРУГ', 7.5)], ['xl', R('СОМНЕВА-', 7.76, 'wobble')], ['xl', R('ЛИСЬ', 8.0, 'wobble')]] },
  { out: 'up', lines: [['m', w('И', 8.5, 'pop'), w('ДУМАЛИ,', 8.7)], ['m', w('ЧТО', 9.14), w('Я', 9.27, 'pop'), w('ПРОСТО', 9.48)], ['xl', w('ВЫБРОШУ', 9.7, 'slide')], ['l', w('ДЕНЬГИ', 10.2)], ['xl', R('НА', 10.44, 'blow'), R('ВЕТЕР', 10.68, 'blow')]] },
  { out: 'left', lines: [['m', w('ВНАЧАЛЕ', 11.5), w('МЕНЯ', 11.92)], ['xl', w('ПРОШИБАЛ', 12.12, 'slide')], ['l', R('ХОЛОДНЫЙ', 12.62, 'shiver')], ['xl', R('ПОТ', 13.14, 'shiver')]] },
  { out: 'up', lines: [['m', w('И', 13.52, 'pop'), w('Я', 13.6, 'pop'), w('БЫЛ', 13.74), w('НА', 13.9)], ['xxl', R('100%', 14.04, 'count')], ['l', w('УВЕРЕН', 14.74, 'drop')]] },
  { out: 'fall', lines: [['m', w('ЧТО', 15.42), w('СЕЙЧАС', 15.56)], ['l', w('ВСЁ', 16.0, 'pop')], ['xl', R('ПРОСРУ', 16.22, 'slam')]] },
  { out: 'left', lines: [['m', w('НО', 17.11), w('МЫ', 17.22)], ['l', w('ВЗЯЛИСЬ', 17.36), w('ЗА', 17.6, 'pop')], ['xl', w('РАБОТУ', 17.8, 'slam')]] },
  { out: 'up', lines: [['l', w('ПРОДУМАЛИ', 18.5)], ['xxl', R('СВЕТ', 18.94, 'flash')]] },
  { out: 'left', lines: [['m', w('СДЕЛАЛИ', 19.48)], ['xl', R('СТИЛЬНЫЙ', 19.82, 'slide')], ['l', w('ИНТЕРЬЕР', 20.34)]] },
  { out: 'up', lines: [['l', w('ДОБАВИЛИ', 21.04)], ['xxl', R('УЮТА', 21.5, 'pop')]] },
  { out: 'left', lines: [['m', w('И', 22.22, 'pop'), w('ПРОДАЛИ', 22.36)], ['m', w('ЕЁ', 22.68), w('ЗА', 22.96, 'pop')], ['xxl', R('80', 23.24, 'count')], ['l', w('ТЫСЯЧ', 23.76, 'slide')]] },
  { out: 'up', lines: [['m', w('ЗА', 24.62), w('ПАРУ', 24.72)], ['l', w('МЕСЯЦЕВ', 24.96)], ['m', w('Я', 25.58, 'pop'), w('ПОДНЯЛ', 25.78)], ['xl', R('БОЛЬШЕ', 26.08, 'grow')]] },
  { out: 'left', lines: [['m', w('ЧЕМ', 26.84), w('ЛЮДИ', 26.92)], ['l', w('ЗАРАБАТЫВАЮТ', 27.16, 'type')], ['xl', R('ЗА', 27.78, 'pop'), R('ПОЛГОДА', 28.05)], ['m', w('РАБОТЫ', 28.42)]] },
  { out: 'up', lines: [['m', w('И', 28.86, 'pop'), w('ВОТ', 29.42), w('ТУТ', 29.7)], ['xl', R('Я', 29.92, 'pop'), R('ПОНЯЛ', 29.98, 'slam')]] },
  { out: 'zoom', lines: [['s', w('КАК', 30.64), w('МОГУ', 30.78)], ['xl', R('ЗАРАБА-', 31.16, 'slide')], ['xl', R('ТЫВАТЬ', 31.42, 'slide')]] },
  { out: 'up', lines: [['l', w('ПОСТЕПЕННО', 32.22, 'type')], ['m', w('ИЗ', 32.84), w('ПЕРВОГО', 33.12)], ['l', w('РИСКОВАННОГО', 33.5, 'slide')], ['l', w('ЭКСПЕРИМЕНТА', 34.12)]] },
  { out: null, lines: [['m', w('ЭТО', 34.82)], ['l', w('ПРЕВРАТИЛОСЬ', 35.26, 'type')], ['m', w('В', 36.2, 'pop'), w('ЧЁТКУЮ', 36.34)], ['xl', R('МОЩНУЮ', 36.74, 'slam')], ['xl', R('СИСТЕМУ', 37.26, 'blocks')]] },
];

// ---------- build layout + timing ----------
const DIRS = { left: [-1500, 0], right: [1500, 0], up: [0, -2300], down: [0, 2300], fall: [0, 2300], zoom: [0, 0] };
function build() {
  SCRIPT.forEach((sc, si) => {
    sc.t0 = sc.lines[0][1].t;
    sc.lines = sc.lines.map(([size, ...words]) => {
      const [weight, maxCap] = SIZE[size];
      const txt = words.map(x => x.txt).join(' ');
      const ll = fit(txt, weight, COL, maxCap);
      let ci = 0;
      for (const wd of words) {
        wd.l = L(wd.txt, weight, ll.size);
        wd.dx = ll.ink + ll.offs[ci] - wd.l.ink;
        ci += wd.txt.length + 1;
      }
      return { ll, words };
    });
    // stack lines, vertically centred
    let y = 0;
    sc.lines.forEach((ln, i) => {
      y += (i ? 0.3 * Math.max(ln.ll.cap, 60) + 14 : 0) + ln.ll.cap;
      ln.y = y;
    });
    sc.lines.forEach(ln => (ln.y += H / 2 - y / 2));
    sc.slams = sc.lines.flatMap(ln => ln.words.filter(x => x.fx === 'slam').map(x => x.t + 0.08));
  });
  SCRIPT.forEach((sc, si) => {
    const next = SCRIPT[si + 1];
    sc.t1 = next ? next.t0 - 0.2 : Infinity; // exit starts
    sc.enter = si ? SCRIPT[si - 1].out : null;
    sc.tIn = si ? SCRIPT[si - 1].t1 + 0.1 : -1;
    sc.idx = si;
  });
}

// ---------- word effects ----------
function drawWord(wd, x, y, t, sc) {
  const { l, t: t0, fx } = wd;
  const col = wd.red ? RED : INK;
  const exitT = sc.t1;
  switch (fx) {
    case 'drop':
      return drawLine(l, x, y, col, { mask: true, letter: rise(t, t0 - 0.03, l, 0.03, 0.5, -1) });
    case 'slide':
      return drawLine(l, x, y, col, { mask: true, maskTight: true, letter: i => { const p = prog(t, t0 - 0.03 + i * 0.025, 0.55); return { dx: (1 - E.outExpo(p)) * 380, a: clamp(p * 5) }; } });
    case 'pop':
      return drawLine(l, x, y, col, { letter: i => { const s = spring(t, t0 - 0.03 + i * 0.03, 2.6, 0.4); return { s, a: clamp(s * 3) }; } });
    case 'type':
      return drawLine(l, x, y, col, { letter: i => { const p = prog(t, t0 - 0.02 + i * 0.032, 0.14); return { a: p > 0 ? 1 : 0, s: 1 + 0.5 * (1 - E.outExpo(p)) }; } });
    case 'slam': {
      const k = E.outExpo(prog(t, t0 - 0.04, 0.22));
      return xf({ s: 1 + 2.4 * (1 - k), ox: x + l.w / 2, oy: y - l.cap / 2 }, () => drawLine(l, x, y, col, { alpha: clamp(prog(t, t0 - 0.04, 0.05)) }));
    }
    case 'crazy': // rises, then letters keep twitching
      return drawLine(l, x, y, col, { mask: t < t0 + 0.4, letter: i => { const r = rise(t, t0 - 0.03, l, 0.03, 0.5)(i); const a = clamp((t - t0 - 0.3) * 3); return { dy: r.dy + a * 7 * Math.sin(t * 23 + i * 2.1), r: a * 0.09 * Math.sin(t * 17 + i * 1.7) }; } });
    case 'wobble': // doubt: letters sway
      return drawLine(l, x, y, col, { mask: t < t0 + 0.45, letter: i => { const r = rise(t, t0 - 0.03, l, 0.025, 0.5)(i); const a = clamp((t - t0 - 0.35) * 2); return { dy: r.dy, dx: a * 10 * Math.sin(t * 7 + i * 0.5), r: a * 0.07 * Math.sin(t * 7 + i * 0.5 + 1) }; } });
    case 'shiver': // cold sweat: fast jitter
      return drawLine(l, x, y, col, { mask: t < t0 + 0.4, letter: i => { const r = rise(t, t0 - 0.03, l, 0.03, 0.5)(i); const a = clamp((t - t0 - 0.25) * 4); const f = Math.floor(t * 40); return { dy: r.dy + a * (hash(i, f) - 0.5) * 9, dx: a * (hash(i + 9, f) - 0.5) * 9 }; } });
    case 'blow': // gone with the wind on exit
      return drawLine(l, x, y, col, { mask: t < t0 + 0.4, letter: i => { const r = rise(t, t0 - 0.03, l, 0.03, 0.5)(i); const p = E.inCubic(prog(t, exitT - 0.32 + i * 0.035, 0.5)); return { dy: r.dy - p * 260 * (1 + hash(i, 1)), dx: p * 1300, r: p * (1.5 + hash(i, 2)), a: 1 - p * 0.3 }; } });
    case 'grow': // letters grow from the baseline
      return drawLine(l, x, y, col, { letter: i => { const s = spring(t, t0 - 0.03 + i * 0.035, 2.2, 0.35); return { sy: Math.max(0.001, s), dy: (l.cap / 2) * (1 - s), a: clamp(s * 4) }; } });
    case 'coins':
    case 'blocks':
      return drawLine(l, x, y, col, { letter: i => { const p = prog(t, t0 - 0.04 + i * 0.03, 0.5); return p <= 0 ? { a: 0 } : { dy: -(1 - E.outBounce(p)) * 1000 }; } });
    case 'box': { // packed into a box drawn around the word
      drawLine(l, x, y, col, { mask: true, letter: rise(t, t0 - 0.03, l, 0.028, 0.5) });
      const p = E.inOutCubic(prog(t, t0 + 0.15, 0.6));
      if (p <= 0) return;
      const pad = 34, bx = x - pad, by = y - l.cap - pad, bw = l.w + pad * 2, bh = l.cap + pad * 2, per = 2 * (bw + bh);
      ctx.save();
      ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineJoin = 'miter';
      ctx.setLineDash([per * p, per]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.restore();
      return;
    }
    case 'flash': { // light: pop + rays
      drawLine(l, x, y, col, { letter: i => { const s = spring(t, t0 - 0.03 + i * 0.03, 2.8, 0.4); return { s, a: clamp(s * 3) }; } });
      const p = prog(t, t0 + 0.05, 0.6);
      if (p <= 0 || p >= 1) return;
      const cx = x + l.w / 2, cy = y - l.cap / 2, R0 = l.w * 0.55 + 40;
      ctx.save();
      ctx.strokeStyle = RED; ctx.lineCap = 'butt'; ctx.lineWidth = 12 * (1 - p);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2, r0 = R0 + 220 * E.outExpo(p), r1 = r0 + 90 * (1 - p);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.75);
        ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.75);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    case 'count': { // rolling digits, other chars rise
      drawLine(l, x, y, col, { mask: true, letter: i => (/\d/.test(l.txt[i]) ? { a: 0 } : rise(t, t0 + 0.3, l, 0, 0.45)(i)) });
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 40, y - l.cap - 30, l.w + 80, l.cap + 60);
      ctx.clip();
      ctx.font = font(l.weight, l.size);
      ctx.fillStyle = col;
      const step = l.cap * 1.35, digits = [...l.txt].filter(c => /\d/.test(c)).length;
      [...l.txt].forEach((c, i) => {
        if (!/\d/.test(c)) return;
        const cx = x + l.ink + l.offs[i] + l.ws[i] / 2;
        const p = +c + 10 * (digits - i + 1) * (1 - E.outExpo(prog(t, t0 - 0.06 + i * 0.05, 0.5)));
        const k = Math.floor(p);
        for (let j = k - 1; j <= k + 1; j++) {
          const d = String(((j % 10) + 10) % 10);
          ctx.fillText(d, cx - ctx.measureText(d).width / 2, y + (j - p) * step);
        }
      });
      ctx.restore();
      return;
    }
    default:
      return drawLine(l, x, y, col, { mask: true, letter: rise(t, t0 - 0.03, l, 0.028, 0.5) });
  }
}

// ---------- screens ----------
function drawScreen(sc, t) {
  if (t < sc.tIn - 0.01 || t > sc.t1 + 0.24) return;
  let x = 0, y = 0, s = 1, r = 0;
  // enter from the side opposite to the previous screen's exit
  if (sc.enter) {
    const k = 1 - E.outExpo(prog(t, sc.tIn, 0.4));
    if (sc.enter === 'zoom') s *= 1 + 2 * k;
    else { const [dx, dy] = DIRS[sc.enter]; x -= dx * k; y -= dy * k; }
  }
  // exit
  if (sc.out) {
    const k = E.inExpo(prog(t, sc.t1, 0.22));
    if (sc.out === 'zoom') s *= 1 - 0.985 * k, r += 0.5 * k;
    else { const [dx, dy] = DIRS[sc.out]; x += dx * k; y += dy * k; if (sc.out === 'fall') r += 0.15 * k; }
  }
  // slow push + slight drift
  const life = prog(t, sc.t0, 2.5);
  s *= 1 + 0.045 * E.outCubic(life);
  r += (sc.idx % 2 ? -1 : 1) * 0.01 * life;
  // impact shake after slams
  for (const ts of sc.slams) {
    const st = t - ts;
    if (st <= 0) continue;
    const a = Math.exp(-st * 9);
    x += a * 28 * Math.sin(st * 2 * Math.PI * 17);
    y += a * 20 * Math.cos(st * 2 * Math.PI * 13);
    s *= 1 + 0.03 * a;
  }
  xf({ x, y, s, r }, () => {
    for (const ln of sc.lines) for (const wd of ln.words) if (t > wd.t - 0.12) drawWord(wd, MARGIN + wd.dx, ln.y, t, sc);
  });
}

function drawScene(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  for (const sc of SCRIPT) drawScreen(sc, t);
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

async function renderFrame(f, samples = 48, shutter = 0.6) {
  const t = f / FPS;
  acc.fill(0);
  for (let k = 0; k < samples; k++) {
    drawScene(t + ((k + 0.5) / samples - 0.5) * (shutter / FPS));
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
