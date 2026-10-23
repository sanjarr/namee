import { clamp, easeIn, easeInOut, easeOut } from '../theme';

export { clamp, easeIn, easeInOut, easeOut };

// «Tech-motion» версия: тёмный фон Sapphire и один неоновый акцент — Immature yellow.
// Все цвета из брендбука «32 КАРАТА» либо производные оттенки от них.
export const D = {
  bg0: '#04254E', // Sapphire
  bg1: '#021733', // Sapphire, темнее к краям
  lime: '#DEFF5C', // Immature yellow
  limeDeep: '#A9CC2E', // нижняя грань плашки
  glow: 'rgba(222,255,92,0.38)',
  white: '#FFFFFF',
  ink: '#04254E', // текст на жёлтой плашке
  indigo: '#5D80D8', // Indigo Crayola
  dim: 'rgba(255,255,255,0.42)',
  faint: 'rgba(255,255,255,0.14)',
  panel: 'rgba(255,255,255,0.045)',
};

export const D_FPS = 30;

// 120 BPM → 1 бит = 15 кадров, 1 такт = 60 кадров. Длительности сцен кратны биту.
const LENGTHS = {
  hook: 150,
  doubt: 210,
  conseq: 330,
  stat: 210,
  solution: 300,
  was: 180,
  benefits: 180,
  cta: 240,
} as const;

export type DScene = keyof typeof LENGTHS;

export const DS = (Object.keys(LENGTHS) as DScene[]).reduce(
  (acc, id, i, ids) => {
    const from = i === 0 ? 0 : acc[ids[i - 1]].from + acc[ids[i - 1]].duration;
    acc[id] = { from, duration: LENGTHS[id] };
    return acc;
  },
  {} as Record<DScene, { from: number; duration: number }>,
);

export const dat = (scene: DScene, local: number) => DS[scene].from + local;

export const D_DURATION = DS.cta.from + DS.cta.duration; // 1800 кадров = 60 с

export const SECTION_NAMES: Record<DScene, string> = {
  hook: 'ХУК',
  doubt: 'СОМНЕНИЕ',
  conseq: 'ПОСЛЕДСТВИЯ',
  stat: 'ЦИФРА',
  solution: 'РЕШЕНИЕ',
  was: 'БЫЛО / СТАЛО',
  benefits: 'ПРЕИМУЩЕСТВА',
  cta: 'ЗАПИСЬ',
};
