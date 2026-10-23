import type { CSSProperties } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp, easeOut } from '../theme';

// scaleX 0→1, transform-origin: left, 20 кадров
export const LineDraw: React.FC<{
  delay?: number;
  width: number;
  height: number;
  color: string;
  style?: CSSProperties;
}> = ({ delay = 0, width, height, color, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 20], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: color,
        transform: `scaleX(${t})`,
        transformOrigin: 'left',
        ...style,
      }}
    />
  );
};
