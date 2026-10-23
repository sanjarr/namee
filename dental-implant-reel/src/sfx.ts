// Саунд-дизайн: кадр (абсолютный) → звук из public/sfx/ (генерирует scripts/make-sfx.py).
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
  ...[2, 5, 8, 11, 14].map((at, i) => ({ at, sfx: 'tick' as const, volume: 0.22, rate: 0.94 + i * 0.03 })),
  { at: 38, sfx: 'drop', volume: 0.3 },
  { at: 56, sfx: 'shimmer', volume: 0.45 },
  // Сцена 2: перелёт и зачёркивание
  { at: 64, sfx: 'whoosh', volume: 0.35 },
  { at: 92, sfx: 'draw', volume: 0.3 },
  // Сцена 3: перелёты между пунктами и разделители
  { at: 134, sfx: 'whoosh', volume: 0.35 },
  { at: 156, sfx: 'draw', volume: 0.22 },
  { at: 170, sfx: 'whoosh', volume: 0.16, rate: 1.15 },
  { at: 186, sfx: 'draw', volume: 0.22, rate: 1.05 },
  { at: 200, sfx: 'whoosh', volume: 0.16, rate: 1.2 },
  { at: 216, sfx: 'draw', volume: 0.22, rate: 1.1 },
  // Сцена 4: цифра
  { at: 276, sfx: 'whoosh', volume: 0.3 },
  { at: 292, sfx: 'pop', volume: 0.2, rate: 0.9 },
  { at: 300, sfx: 'draw', volume: 0.2, rate: 1.2 },
  // Сцена 5: превращение в винт и сборка имплантата
  { at: 346, sfx: 'whoosh', volume: 0.35 },
  { at: 380, sfx: 'sparkle', volume: 0.28 },
  { at: 394, sfx: 'tick', volume: 0.25, rate: 0.85 },
  { at: 416, sfx: 'click', volume: 0.4 },
  { at: 430, sfx: 'chime', volume: 0.18 },
  { at: 476, sfx: 'shimmer', volume: 0.3, rate: 1.12 },
  // Сцена 6: круг, орбита и смена преимуществ
  { at: 484, sfx: 'whoosh', volume: 0.22 },
  { at: 506, sfx: 'sparkle', volume: 0.35 },
  { at: 518, sfx: 'pop', volume: 0.2 },
  { at: 538, sfx: 'pop', volume: 0.2, rate: 1.06 },
  { at: 557, sfx: 'pop', volume: 0.2, rate: 1.12 },
  // Сцена 7: карточка, контур кнопки, блик, пульс
  { at: 566, sfx: 'whoosh', volume: 0.3 },
  { at: 576, sfx: 'whoosh', volume: 0.14, rate: 0.8 },
  { at: 600, sfx: 'sparkle', volume: 0.32 },
  { at: 620, sfx: 'pop', volume: 0.26, rate: 0.85 },
  { at: 632, sfx: 'chime', volume: 0.3 },
  { at: 648, sfx: 'pop', volume: 0.1, rate: 0.75 },
  { at: 684, sfx: 'pop', volume: 0.1, rate: 0.75 },
];
