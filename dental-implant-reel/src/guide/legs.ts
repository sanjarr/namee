import { flyEase } from '../theme';

// Таблица сегментов проводника (ТЗ, раздел 5.3). Кадры абсолютные.
export type Pt = [number, number];
export type WordBounds = { left: number; right: number };

type Base = { id: string; start: number; end: number };

export type Leg =
  | (Base & { kind: 'appear'; at: Pt; spring: 'bounce' | 'soft'; flash?: boolean })
  | (Base & { kind: 'fly'; path: string })
  | (Base & { kind: 'draw'; path: string; livesUntil: [number, number] | null; pulse?: boolean })
  | (Base & { kind: 'morph'; at: Pt; toScale: number })
  | (Base & { kind: 'vanish'; at: Pt });

export type PathLeg = Extract<Leg, { path: string }>;

// Орбита G16: от верхней точки круга по часовой, первые 6 кадров радиус
// растёт 60→76. Полтора оборота (540°), чтобы закончить в нижней точке
// (540, 796), откуда начинается G17 — без «телепорта».
const orbitPath = (
  c: Pt,
  r0: number,
  r1: number,
  rampFrames: number,
  duration: number,
  turns: number,
) => {
  const rampU = flyEase(rampFrames / duration);
  const steps = 240;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const r = r0 + (r1 - r0) * Math.min(1, u / rampU);
    const a = -Math.PI / 2 + u * turns * 2 * Math.PI;
    pts.push(`${(c[0] + r * Math.cos(a)).toFixed(2)} ${(c[1] + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts[0]} ${pts.slice(1).map((p) => `L${p}`).join(' ')}`;
};

// Пилюля x 180…900, y 1230…1350, r = 60, по часовой от левой середины
const PILL = 'M180 1290 A60 60 0 0 1 240 1230 L840 1230 A60 60 0 0 1 840 1350 L240 1350 A60 60 0 0 1 180 1290';

// Окружность центр (540, 720), r = 60, по часовой от верхней точки
const CIRCLE = 'M540 660 A60 60 0 1 1 540 780 A60 60 0 1 1 540 660';

export const buildLegs = (W: WordBounds): Leg[] => {
  const wl = W.left - 24;
  const wr = W.right + 24;
  return [
    { id: 'G0', kind: 'appear', start: 56, end: 64, at: [540, 1180], spring: 'bounce', flash: true },
    { id: 'G1', kind: 'fly', start: 64, end: 92, path: `M540 1180 C540 1040 300 1010 ${wl} 900` },
    { id: 'G2', kind: 'draw', start: 92, end: 106, path: `M${wl} 900 L${wr} 900`, livesUntil: [134, 144] },
    { id: 'G3', kind: 'fly', start: 134, end: 156, path: `M${wr} 900 C900 640 360 420 120 520` },
    { id: 'G4', kind: 'draw', start: 156, end: 170, path: 'M120 520 L960 520', livesUntil: [278, 288] },
    { id: 'G5', kind: 'fly', start: 170, end: 186, path: 'M960 520 C1010 640 60 700 120 820' },
    { id: 'G6', kind: 'draw', start: 186, end: 200, path: 'M120 820 L960 820', livesUntil: [278, 288] },
    { id: 'G7', kind: 'fly', start: 200, end: 216, path: 'M960 820 C1010 940 60 1000 120 1120' },
    { id: 'G8', kind: 'draw', start: 216, end: 230, path: 'M120 1120 L960 1120', livesUntil: [278, 288] },
    { id: 'G9', kind: 'fly', start: 276, end: 300, path: 'M960 1120 C1000 1240 420 1180 480 1050' },
    { id: 'G10', kind: 'draw', start: 300, end: 310, path: 'M480 1050 L600 1050', livesUntil: [350, 360] },
    { id: 'G11', kind: 'fly', start: 346, end: 380, path: 'M600 1050 C820 1100 360 1180 540 1250' },
    { id: 'G12', kind: 'morph', start: 380, end: 392, at: [540, 1250], toScale: 3.2 },
    { id: 'G13', kind: 'appear', start: 476, end: 484, at: [540, 900], spring: 'soft' },
    { id: 'G14', kind: 'fly', start: 484, end: 506, path: 'M540 900 C360 900 420 660 540 660' },
    { id: 'G15', kind: 'draw', start: 506, end: 524, path: CIRCLE, livesUntil: [566, 576] },
    { id: 'G16', kind: 'fly', start: 524, end: 566, path: orbitPath([540, 720], 60, 76, 6, 42, 1.5) },
    { id: 'G17', kind: 'fly', start: 566, end: 600, path: 'M540 796 C540 1000 120 1100 180 1290' },
    // G20 (пульс контура) — флаг pulse: вспышки берутся из CTA_PULSE_FRAMES
    { id: 'G18', kind: 'draw', start: 600, end: 628, path: PILL, livesUntil: null, pulse: true },
    { id: 'G19', kind: 'vanish', start: 628, end: 640, at: [180, 1290] },
  ];
};
