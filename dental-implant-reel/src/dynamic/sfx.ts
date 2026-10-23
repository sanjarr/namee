import type { SfxName } from '../sfx';
import { dat } from './theme';

export type DCue = { at: number; sfx: SfxName | 'impact' | 'type' | 'riser'; volume: number; rate?: number };

// Саунд-дизайн «tech-motion»: кадр → звук. Метки от начала сцены через dat().
export const DSFX: DCue[] = [
  // 1. Хук
  { at: dat('hook', 0), sfx: 'impact', volume: 0.7 },
  { at: dat('hook', 40), sfx: 'whoosh', volume: 0.3 },
  { at: dat('hook', 50), sfx: 'pop', volume: 0.25, rate: 1.1 },
  { at: dat('hook', 64), sfx: 'pop', volume: 0.25, rate: 1.2 },
  { at: dat('hook', 84), sfx: 'impact', volume: 0.6, rate: 1.1 },
  { at: dat('hook', 98), sfx: 'riser', volume: 0.35 },
  // 2. Сомнение
  { at: dat('doubt', 12), sfx: 'tick', volume: 0.25 },
  { at: dat('doubt', 32), sfx: 'draw', volume: 0.42 },
  { at: dat('doubt', 42), sfx: 'tick', volume: 0.25, rate: 1.05 },
  { at: dat('doubt', 62), sfx: 'draw', volume: 0.42, rate: 1.05 },
  { at: dat('doubt', 72), sfx: 'tick', volume: 0.25, rate: 1.1 },
  { at: dat('doubt', 92), sfx: 'draw', volume: 0.42, rate: 1.1 },
  { at: dat('doubt', 130), sfx: 'pop', volume: 0.25 },
  { at: dat('doubt', 142), sfx: 'impact', volume: 0.7, rate: 0.9 },
  // 3. Последствия (3 части по 110 кадров)
  { at: dat('conseq', 2), sfx: 'whoosh', volume: 0.3 },
  { at: dat('conseq', 6), sfx: 'pop', volume: 0.25 },
  ...[0, 1, 2].flatMap((i) => [
    { at: dat('conseq', i * 110 + 22), sfx: 'whoosh' as const, volume: 0.2, rate: 1 + i * 0.08 },
    { at: dat('conseq', i * 110 + 8), sfx: 'type' as const, volume: 0.25 },
    { at: dat('conseq', i * 110 + 40), sfx: 'type' as const, volume: 0.22 },
    { at: dat('conseq', i * 110 + 74), sfx: 'pop' as const, volume: 0.3, rate: 1.1 + i * 0.06 },
  ]),
  // 4. Цифра
  { at: dat('stat', 4), sfx: 'pop', volume: 0.25, rate: 0.9 },
  { at: dat('stat', 8), sfx: 'riser', volume: 0.3, rate: 1.6 },
  { at: dat('stat', 52), sfx: 'impact', volume: 0.8, rate: 0.8 },
  { at: dat('stat', 64), sfx: 'draw', volume: 0.3, rate: 0.9 },
  { at: dat('stat', 92), sfx: 'pop', volume: 0.3, rate: 1.1 },
  // 5. Решение
  { at: dat('solution', 0), sfx: 'whoosh', volume: 0.3 },
  { at: dat('solution', 14), sfx: 'impact', volume: 0.7, rate: 1.1 },
  { at: dat('solution', 60), sfx: 'whoosh', volume: 0.3, rate: 1.1 },
  { at: dat('solution', 84), sfx: 'sparkle', volume: 0.3 },
  { at: dat('solution', 98), sfx: 'tick', volume: 0.3, rate: 0.85 },
  { at: dat('solution', 94), sfx: 'draw', volume: 0.25 },
  { at: dat('solution', 114), sfx: 'draw', volume: 0.25, rate: 1.1 },
  { at: dat('solution', 120), sfx: 'click', volume: 0.5 },
  { at: dat('solution', 134), sfx: 'chime', volume: 0.25 },
  { at: dat('solution', 134), sfx: 'draw', volume: 0.25, rate: 1.2 },
  // 6. Было/стало
  { at: dat('was', 8), sfx: 'pop', volume: 0.2 },
  { at: dat('was', 52), sfx: 'draw', volume: 0.38, rate: 0.95 },
  { at: dat('was', 64), sfx: 'draw', volume: 0.38, rate: 1.05 },
  { at: dat('was', 76), sfx: 'pop', volume: 0.3, rate: 1.2 },
  { at: dat('was', 88), sfx: 'tick', volume: 0.35 },
  { at: dat('was', 106), sfx: 'tick', volume: 0.35, rate: 1.1 },
  { at: dat('was', 124), sfx: 'shimmer', volume: 0.4 },
  // 7. Преимущества
  { at: dat('benefits', 0), sfx: 'pop', volume: 0.25 },
  ...[28, 68, 108].flatMap((f, i) => [
    { at: dat('benefits', f), sfx: 'whoosh' as const, volume: 0.15, rate: 1.1 },
    { at: dat('benefits', f + 14), sfx: 'sparkle' as const, volume: 0.28, rate: 1 + i * 0.1 },
  ]),
  // 8. Запись
  { at: dat('cta', 0), sfx: 'whoosh', volume: 0.3 },
  { at: dat('cta', 10), sfx: 'impact', volume: 0.75 },
  ...[84, 93, 102, 111, 120, 129].map((f) => ({ at: dat('cta', f), sfx: 'type' as const, volume: 0.28 })),
  { at: dat('cta', 70), sfx: 'pop', volume: 0.25 },
  { at: dat('cta', 118), sfx: 'click', volume: 0.35 },
  { at: dat('cta', 148), sfx: 'whoosh', volume: 0.3, rate: 0.9 },
  { at: dat('cta', 152), sfx: 'shimmer', volume: 0.45 },
  { at: dat('cta', 166), sfx: 'tick', volume: 0.2 },
  { at: dat('cta', 196), sfx: 'chime', volume: 0.4 },
];
