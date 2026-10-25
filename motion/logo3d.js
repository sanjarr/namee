// 3D logo reveal: "32 КАРАТА" — diamond facets fly in from depth and assemble the crown,
// the tooth root flips up under it, a light sweep + sparkle runs over the stone, then the
// lettering flips up. Each traced island of the logo is extruded into its own mesh.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1080, H = 1920, FPS = 60, DURATION = 7.0;
const S = 0.01; // logo px -> world units
const CX = 540, CY = 540;

// ---------- easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, t0, d) => clamp((t - t0) / d);
const lerp = (a, b, k) => a + (b - a) * k;
const outExpo = k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const outCubic = k => 1 - Math.pow(1 - k, 3);
const inOutCubic = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
function spring(t, t0, f = 2.2, z = 0.42) {
  const x = t - t0;
  if (x <= 0) return 0;
  const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x));
}
// deterministic random
const rnd = (i, k = 0) => { const x = Math.sin(i * 91.7 + k * 47.3 + 13.1) * 43758.5453; return x - Math.floor(x); };

let renderer, scene, camera, tooth, pieces = [], sparkles = [], dust, sweep, sweep2;

function shapeOf(island, cx, cy) {
  const toV = ([x, y]) => new THREE.Vector2((x - cx) * S, -(y - cy) * S);
  const s = new THREE.Shape(island.outer.map(toV));
  for (const h of island.holes) s.holes.push(new THREE.Path(h.map(toV)));
  return s;
}

function starTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.08, 'rgba(255,255,255,0.8)');
  grd.addColorStop(0.3, 'rgba(255,255,255,0.08)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  // four-point star rays
  g.globalCompositeOperation = 'lighter';
  for (const [w, l] of [[3, 128], [1.5, 90]]) {
    for (let k = 0; k < (l === 128 ? 2 : 2); k++) {
      g.save();
      g.translate(128, 128);
      g.rotate((k * Math.PI) / 2 + (l === 128 ? 0 : Math.PI / 4));
      const lg = g.createLinearGradient(-l, 0, l, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0)');
      lg.addColorStop(0.5, 'rgba(255,255,255,1)');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg;
      g.beginPath();
      g.moveTo(-l, 0); g.lineTo(0, -w); g.lineTo(l, 0); g.lineTo(0, w);
      g.fill();
      g.restore();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function bgTexture() {
  const c = document.createElement('canvas');
  c.width = 540; c.height = 960;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(270, 430, 0, 270, 480, 620);
  grd.addColorStop(0, '#22232a');
  grd.addColorStop(0.45, '#111216');
  grd.addColorStop(1, '#040405');
  g.fillStyle = grd;
  g.fillRect(0, 0, 540, 960);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

async function build() {
  const data = await (await fetch('logo_32karata.json')).json();
  scene = new THREE.Scene();
  scene.background = bgTexture();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.9;

  camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 400);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-6, 9, 12);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd4ff, 1.6);
  rim.position.set(8, 4, -10);
  scene.add(rim);
  sweep = new THREE.PointLight(0xffffff, 0, 14, 2);
  scene.add(sweep);
  sweep2 = new THREE.PointLight(0xffffff, 0, 14, 2);
  scene.add(sweep2);

  const gemMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.92, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2.2 });
  const enamelMat = new THREE.MeshPhysicalMaterial({ color: 0xf2f1ee, metalness: 0.0, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.15, sheen: 0.4, sheenColor: 0xffffff });
  const textMat = new THREE.MeshPhysicalMaterial({ color: 0xf5f5f5, metalness: 0.1, roughness: 0.3, clearcoat: 0.7 });

  tooth = new THREE.Group();
  tooth.position.set(0, -(400 - CY) * S, 0); // pivot near the tooth centre
  scene.add(tooth);
  const toothPivot = new THREE.Vector3(CX, 400, 0);

  const depth = { facet: 0.32, body: 0.55, title: 0.45, sub: 0.12 };
  const crown = { x: 540, y: 300 };
  const order = { facet: 0, title: 0, sub: 0 };
  for (const isl of data.islands) {
    const [bx, by, bw, bh] = isl.bbox;
    const cx = bx + bw / 2, cy = by + bh / 2;
    const d = depth[isl.kind];
    const geo = new THREE.ExtrudeGeometry(shapeOf(isl, cx, cy), {
      depth: d, bevelEnabled: true, bevelThickness: d * 0.12, bevelSize: isl.kind === 'sub' ? 0.004 : 0.018, bevelSegments: 2, curveSegments: 1,
    });
    geo.translate(0, 0, -d / 2);
    let mat = isl.kind === 'facet' ? gemMat.clone() : isl.kind === 'body' ? enamelMat : textMat;
    const mesh = new THREE.Mesh(geo, mat);
    const p = { kind: isl.kind, mesh, i: order[isl.kind] ?? 0, cx, cy };
    if (isl.kind in order) order[isl.kind]++;
    if (isl.kind === 'facet' || isl.kind === 'body') {
      p.home = new THREE.Vector3((cx - toothPivot.x) * S, -(cy - toothPivot.y) * S, 0);
      tooth.add(mesh);
    } else {
      p.home = new THREE.Vector3((cx - CX) * S, -(cy - CY) * S, 0);
      scene.add(mesh);
    }
    if (isl.kind === 'facet') {
      // centre facets land first, outer ones later
      const dist = Math.hypot(cx - crown.x, cy - crown.y);
      p.t0 = -0.25 + dist * 0.0042 + rnd(p.i, 1) * 0.18;
      const a = rnd(p.i, 2) * Math.PI * 2, r = 5 + rnd(p.i, 3) * 7;
      p.from = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 1.1, 1 + rnd(p.i, 4) * 6);
      p.rot0 = new THREE.Euler((rnd(p.i, 5) - 0.5) * 7, (rnd(p.i, 6) - 0.5) * 7, (rnd(p.i, 7) - 0.5) * 5);
      // final facet tilt so each one catches the light differently, like a cut stone
      p.rot1 = new THREE.Euler((rnd(p.i, 8) - 0.5) * 0.22, (rnd(p.i, 9) - 0.5) * 0.22, 0);
    }
    pieces.push(p);
  }

  const tex = starTexture();
  for (let k = 0; k < 3; k++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true }));
    sp.renderOrder = 10;
    scene.add(sp);
    sparkles.push(sp);
  }

  // floating dust for depth parallax
  const N = 420, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (rnd(i, 11) - 0.5) * 40;
    pos[i * 3 + 1] = (rnd(i, 12) - 0.5) * 50;
    pos[i * 3 + 2] = -25 + rnd(i, 13) * 45;
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);
}

// camera flight: close and angled inside the incoming facets -> framing the tooth -> pull back to full logo
const camKeys = [
  [new THREE.Vector3(6.5, -2.5, 11), new THREE.Vector3(0, 2.4, 0)],
  [new THREE.Vector3(-3.2, 1.2, 15.5), new THREE.Vector3(0, 2.3, 0)],
  [new THREE.Vector3(0.6, 2.0, 15.5), new THREE.Vector3(0, 1.8, 0)],
  [new THREE.Vector3(0, 0.4, 42.5), new THREE.Vector3(0, 0.15, 0)],
];
const camCurve = new THREE.CatmullRomCurve3(camKeys.map(k => k[0]), false, 'centripetal');
const tgtCurve = new THREE.CatmullRomCurve3(camKeys.map(k => k[1]), false, 'centripetal');

function update(t) {
  // camera
  const u = 1 - Math.pow(1 - clamp(t / 4.3), 2.4);
  const cp = camCurve.getPoint(u), tp = tgtCurve.getPoint(u);
  const push = inOutCubic(prog(t, 4.3, 2.7));
  cp.z -= 2.4 * push;
  camera.position.copy(cp);
  camera.lookAt(tp);

  // tooth group: slow turn into place, then a gentle float
  const turn = outCubic(prog(t, 1.2, 2.6));
  tooth.rotation.y = lerp(-0.55, 0, turn) + 0.04 * Math.sin(t * 1.3) * prog(t, 3.5, 1);
  tooth.rotation.x = lerp(0.18, 0, turn);

  for (const p of pieces) {
    const m = p.mesh;
    if (p.kind === 'facet') {
      const k = prog(t, p.t0, 1.35), e = outExpo(k), r = outCubic(k);
      m.position.lerpVectors(p.from.clone().add(p.home), p.home, e);
      m.rotation.set(lerp(p.rot0.x, p.rot1.x, r), lerp(p.rot0.y, p.rot1.y, r), lerp(p.rot0.z, p.rot1.z, r));
      m.visible = t > p.t0 - 0.01;
      // glint when the facet clicks into place
      const land = t - (p.t0 + 0.55);
      m.material.emissive.setRGB(1, 1, 1);
      m.material.emissiveIntensity = land > 0 ? 0.55 * Math.exp(-land * 6) : 0;
    } else if (p.kind === 'body') {
      const s = spring(t, 1.75, 1.6, 0.5);
      m.position.set(p.home.x, p.home.y - (1 - s) * 2.6, p.home.z);
      m.rotation.set(0, (1 - s) * -Math.PI * 0.5, 0);
      m.visible = t > 1.74;
    } else if (p.kind === 'title') {
      const t0 = 3.55 + p.i * 0.065, s = spring(t, t0, 1.9, 0.45);
      m.position.set(p.home.x, p.home.y - (1 - s) * 0.7, p.home.z - (1 - clamp(s)) * 1.5);
      m.rotation.set((1 - s) * -Math.PI * 0.5, 0, 0);
      m.visible = t > t0;
    } else {
      const t0 = 4.2 + p.i * 0.02, s = spring(t, t0, 2.4, 0.5);
      m.position.set(p.home.x, p.home.y - (1 - s) * 0.35, p.home.z);
      m.rotation.set(0, (1 - s) * 1.2, 0);
      m.scale.setScalar(Math.max(0.001, clamp(s * 1.6)));
      m.visible = t > t0;
    }
  }

  // light sweeps: across the stone, then across the lettering
  const k1 = prog(t, 2.75, 0.9);
  sweep.position.set(lerp(-7, 7, inOutCubic(k1)), 2.6, 3.5);
  sweep.intensity = Math.sin(Math.PI * k1) * 260;
  const k2 = prog(t, 4.9, 1.1);
  sweep2.position.set(lerp(-9, 9, inOutCubic(k2)), -1.4, 3.2);
  sweep2.intensity = Math.sin(Math.PI * k2) * 220;

  // sparkles on the crown
  const spots = [[3.05, 600, 268, 2.4], [3.25, 470, 300, 1.4], [5.55, 548, 262, 2.8]];
  tooth.updateMatrixWorld(true);
  sparkles.forEach((sp, k) => {
    const [ts, x, y, sz] = spots[k];
    const q = prog(t, ts, 0.7);
    const a = Math.sin(Math.PI * q);
    sp.visible = q > 0 && q < 1;
    const v = new THREE.Vector3((x - CX) * S, -(y - 400) * S, 0.35);
    tooth.localToWorld(v);
    sp.position.copy(v);
    sp.scale.setScalar(sz * a + 0.001);
    sp.material.rotation = q * 1.2;
    sp.material.opacity = a;
  });

  dust.rotation.y = t * 0.02;
  dust.position.y = t * 0.15;
}

// ---------- frame rendering with motion blur + sub-pixel AA ----------
let acc, px, out, octx;
window.init = async () => {
  const cv = document.getElementById('c');
  cv.width = W; cv.height = H;
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  await build();
  acc = new Float32Array(W * H * 3);
  px = new Uint8Array(W * H * 4);
  out = document.createElement('canvas');
  out.width = W; out.height = H;
  octx = out.getContext('2d');
  return { W, H, FPS, frames: Math.round(DURATION * FPS) };
};

window.renderFrame = async (f, samples = 12, shutter = 0.6) => {
  const gl = renderer.getContext();
  acc.fill(0);
  for (let k = 0; k < samples; k++) {
    const t = f / FPS + ((k + 0.5) / samples - 0.5) * (shutter / FPS);
    update(t);
    // jitter the projection by a sub-pixel amount each sample (free antialiasing)
    camera.setViewOffset(W, H, rnd(k, 21) - 0.5, rnd(k, 22) - 0.5, W, H);
    renderer.render(scene, camera);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
    for (let p = 0, q = 0; p < px.length; p += 4, q += 3) {
      acc[q] += px[p]; acc[q + 1] += px[p + 1]; acc[q + 2] += px[p + 2];
    }
  }
  const img = octx.createImageData(W, H), o = img.data, inv = 1 / samples;
  for (let y = 0; y < H; y++) {
    // readPixels is bottom-up
    let q = (H - 1 - y) * W * 3, p = y * W * 4;
    for (let x = 0; x < W; x++, q += 3, p += 4) {
      o[p] = acc[q] * inv + 0.5; o[p + 1] = acc[q + 1] * inv + 0.5; o[p + 2] = acc[q + 2] * inv + 0.5; o[p + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  const blob = await new Promise(r => out.toBlob(r, 'image/png'));
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(s);
};
