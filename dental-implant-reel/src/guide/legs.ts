import { at, flyEase } from '../theme';

// Таблица сегментов проводника (ТЗ, раздел 5.3).
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
// растёт 60→76. Число оборотов — n + 0,5, чтобы закончить в нижней точке
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
  const steps = 400;
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

// Кадры задаются от начала сцены через at(сцена, кадр) — так паузы на
// чтение меняются в одном месте (SCENES в theme.ts), а проводник не рвётся.
export const buildLegs = (W: WordBounds): Leg[] => {
  const wl = W.left - 24;
  const wr = W.right + 24;
  const orbit = { start: at('s6', 20), end: at('s6', 152) };
  return [
    // Сцена 1: имплантат рождается в пустом месте и ждёт, пока прочитают вопрос
    { id: 'G0', kind: 'appear', start: at('s1', 56), end: at('s1', 64), at: [540, 1180], spring: 'bounce', flash: true },
    { id: 'G1', kind: 'fly', start: at('s1', 100), end: at('s2', 20), path: `M540 1180 C540 1040 300 1010 ${wl} 900` },
    // Сцена 2: зачёркивание «мелочь.»
    { id: 'G2', kind: 'draw', start: at('s2', 20), end: at('s2', 34), path: `M${wl} 900 L${wr} 900`, livesUntil: [at('s2', 98), at('s2', 108)] },
    // Сцена 3: три разделителя, между ними — паузы на чтение пунктов
    { id: 'G3', kind: 'fly', start: at('s2', 98), end: at('s3', 14), path: `M${wr} 900 C900 640 360 420 120 520` },
    { id: 'G4', kind: 'draw', start: at('s3', 14), end: at('s3', 28), path: 'M120 520 L960 520', livesUntil: [at('s3', 222), at('s3', 234)] },
    { id: 'G5', kind: 'fly', start: at('s3', 52), end: at('s3', 68), path: 'M960 520 C1010 640 60 700 120 820' },
    { id: 'G6', kind: 'draw', start: at('s3', 68), end: at('s3', 82), path: 'M120 820 L960 820', livesUntil: [at('s3', 222), at('s3', 234)] },
    { id: 'G7', kind: 'fly', start: at('s3', 106), end: at('s3', 122), path: 'M960 820 C1010 940 60 1000 120 1120' },
    { id: 'G8', kind: 'draw', start: at('s3', 122), end: at('s3', 136), path: 'M120 1120 L960 1120', livesUntil: [at('s3', 222), at('s3', 234)] },
    // Сцена 4: подчёркивание «25%»
    { id: 'G9', kind: 'fly', start: at('s3', 222), end: at('s4', 12), path: 'M960 1120 C1000 1240 420 1180 480 1050' },
    { id: 'G10', kind: 'draw', start: at('s4', 12), end: at('s4', 22), path: 'M480 1050 L600 1050', livesUntil: [at('s4', 132), at('s4', 144)] },
    // Сцена 5: превращение в винт, затем возвращение над коронкой
    { id: 'G11', kind: 'fly', start: at('s4', 130), end: at('s5', 20), path: 'M600 1050 C820 1100 360 1180 540 1250' },
    { id: 'G12', kind: 'morph', start: at('s5', 20), end: at('s5', 32), at: [540, 1250], toScale: 3.2 },
    { id: 'G13', kind: 'appear', start: at('s5', 134), end: at('s5', 142), at: [540, 900], spring: 'soft' },
    { id: 'G14', kind: 'fly', start: at('s5', 142), end: at('s6', 2), path: 'M540 900 C360 900 420 660 540 660' },
    // Сцена 6: круг для иконок и спокойная орбита, пока читаются фразы
    { id: 'G15', kind: 'draw', start: at('s6', 2), end: at('s6', 20), path: CIRCLE, livesUntil: [at('s6', 152), at('s6', 162)] },
    // 2,5 оборота: орбита заканчивается в нижней точке (540, 796), откуда стартует G17
    { id: 'G16', kind: 'fly', start: orbit.start, end: orbit.end, path: orbitPath([540, 720], 60, 76, 6, orbit.end - orbit.start, 2.5) },
    { id: 'G17', kind: 'fly', start: at('s6', 152), end: at('s7', 24), path: 'M540 796 C540 1000 120 1100 180 1290' },
    // Сцена 7: контур кнопки; G20 (пульс контура) — флаг pulse, кадры из CTA_PULSE_FRAMES
    { id: 'G18', kind: 'draw', start: at('s7', 24), end: at('s7', 52), path: PILL, livesUntil: null, pulse: true },
    { id: 'G19', kind: 'vanish', start: at('s7', 52), end: at('s7', 64), at: [180, 1290] },
  ];
};
