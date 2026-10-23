import { at } from './theme';

// Саунд-дизайн: кадр (от начала сцены, через at) → звук из public/sfx/ (генерирует scripts/make-sfx.py).
// Громкости подобраны тихими: звуки поддерживают анимацию, а не спорят с музыкой.
export type SfxName =
  | 'shimmer'
  | 'whoosh'
  | 'sparkle'
  | 'draw'
  | 'tick'
  | 'pop'
  | 'drop'
  | 'click'
  | 'chime';

export type Cue = { at: number; sfx: SfxName; volume: number; rate?: number };

export const SFX_CUES: Cue[] = [
  // Сцена 1: зубы встают в ряд, центральный исчезает, рождается имплантат
  ...[2, 5, 8, 11, 14].map((f, i) => ({ at: at('s1', f), sfx: 'tick' as const, volume: 0.22, rate: 0.94 + i * 0.03 })),
  { at: at('s1', 38), sfx: 'drop', volume: 0.3 },
  { at: at('s1', 56), sfx: 'shimmer', volume: 0.45 },
  // Сцена 2: перелёт и зачёркивание
  { at: at('s1', 100), sfx: 'whoosh', volume: 0.35 },
  { at: at('s2', 20), sfx: 'draw', volume: 0.3 },
  // Сцена 3: перелёты между пунктами и разделители
  { at: at('s2', 98), sfx: 'whoosh', volume: 0.35 },
  { at: at('s3', 14), sfx: 'draw', volume: 0.22 },
  { at: at('s3', 52), sfx: 'whoosh', volume: 0.16, rate: 1.15 },
  { at: at('s3', 68), sfx: 'draw', volume: 0.22, rate: 1.05 },
  { at: at('s3', 106), sfx: 'whoosh', volume: 0.16, rate: 1.2 },
  { at: at('s3', 122), sfx: 'draw', volume: 0.22, rate: 1.1 },
  // Сцена 4: цифра
  { at: at('s3', 222), sfx: 'whoosh', volume: 0.3 },
  { at: at('s4', 4), sfx: 'pop', volume: 0.2, rate: 0.9 },
  { at: at('s4', 12), sfx: 'draw', volume: 0.2, rate: 1.2 },
  // Сцена 5: превращение в винт и сборка имплантата
  { at: at('s4', 130), sfx: 'whoosh', volume: 0.35 },
  { at: at('s5', 20), sfx: 'sparkle', volume: 0.28 },
  { at: at('s5', 34), sfx: 'tick', volume: 0.25, rate: 0.85 },
  { at: at('s5', 56), sfx: 'click', volume: 0.4 },
  { at: at('s5', 70), sfx: 'chime', volume: 0.18 },
  { at: at('s5', 134), sfx: 'shimmer', volume: 0.3, rate: 1.12 },
  // Сцена 6: круг, орбита и смена преимуществ
  { at: at('s5', 142), sfx: 'whoosh', volume: 0.22 },
  { at: at('s6', 2), sfx: 'sparkle', volume: 0.35 },
  { at: at('s6', 14), sfx: 'pop', volume: 0.2 },
  { at: at('s6', 64), sfx: 'pop', volume: 0.2, rate: 1.06 },
  { at: at('s6', 113), sfx: 'pop', volume: 0.2, rate: 1.12 },
  // Сцена 7: карточка, контур кнопки, блик, пульс
  { at: at('s6', 152), sfx: 'whoosh', volume: 0.3 },
  { at: at('s7', 0), sfx: 'whoosh', volume: 0.14, rate: 0.8 },
  { at: at('s7', 24), sfx: 'sparkle', volume: 0.32 },
  { at: at('s7', 44), sfx: 'pop', volume: 0.26, rate: 0.85 },
  { at: at('s7', 56), sfx: 'chime', volume: 0.3 },
  ...[72, 108, 144].map((f) => ({ at: at('s7', f), sfx: 'pop' as const, volume: 0.1, rate: 0.75 })),
];
