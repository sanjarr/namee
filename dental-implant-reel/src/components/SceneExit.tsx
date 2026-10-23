import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { clamp, easeIn } from '../theme';

// Выход сцены: opacity 1→0, translateY 0→−40, easeIn. На проводник не действует.
export const SceneExit: React.FC<{ from: number; to: number; children: ReactNode }> = ({
  from,
  to,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [from, to], [0, 1], { ...clamp, easing: easeIn });
  return (
    <AbsoluteFill style={{ opacity: 1 - t, transform: `translateY(${-40 * t}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
