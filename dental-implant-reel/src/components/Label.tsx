import type { ReactNode } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp, easeOut } from '../theme';
import { type } from '../typography';

// Лейбл: opacity 0→1, letter-spacing 0.5em→0.28em, кадры 0–20
export const AnimatedLabel: React.FC<{ text: string; before?: ReactNode }> = ({ text, before }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: easeOut });
  const spacing = 0.5 + (0.28 - 0.5) * t;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      {before}
      <span
        style={{
          ...type.label,
          opacity: t,
          letterSpacing: `${spacing}em`,
          // компенсируем хвостовой letter-spacing, чтобы слово стояло по центру
          marginRight: `-${spacing}em`,
        }}
      >
        {text}
      </span>
    </div>
  );
};
