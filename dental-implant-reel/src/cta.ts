import { interpolate } from 'remotion';
import { DURATION, clamp, easeInOut } from './theme';

// Пульс кнопки CTA: с абс. кадра 648 каждые 36 кадров, 1→1→0 за 18 кадров.
// Общий для кнопки (сцена 7) и контура, нарисованного проводником (G18/G20).
export const CTA_CENTER = { x: 540, y: 1290 };
export const CTA_PULSE_FRAMES = Array.from({ length: 4 }, (_, i) => 648 + i * 36).filter(
  (f) => f < DURATION,
);

export const ctaPulse = (absFrame: number) =>
  CTA_PULSE_FRAMES.reduce(
    (acc, p) =>
      acc + interpolate(absFrame, [p, p + 9, p + 18], [0, 1, 0], { ...clamp, easing: easeInOut }),
    0,
  );

export const ctaScale = (absFrame: number) => 1 + 0.04 * ctaPulse(absFrame);
