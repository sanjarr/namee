import type { CSSProperties, ReactNode } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp, easeOut } from '../theme';

// overflow: hidden, внутренний блок translateY 100%→0 за 20 кадров
export const MaskReveal: React.FC<{
  delay?: number;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ delay = 0, style, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 20], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ overflow: 'hidden', ...style }}>
      <div style={{ transform: `translateY(${(1 - t) * 100}%)` }}>{children}</div>
    </div>
  );
};
