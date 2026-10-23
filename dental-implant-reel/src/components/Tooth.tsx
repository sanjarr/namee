import type { CSSProperties } from 'react';
import { colors } from '../theme';

export const TOOTH_W = 110;
export const TOOTH_H = 150;

export const Tooth: React.FC<{ x: number; cy: number; style?: CSSProperties }> = ({
  x,
  cy,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: cy - TOOTH_H / 2,
      width: TOOTH_W,
      height: TOOTH_H,
      borderRadius: 40,
      backgroundColor: colors.surface,
      border: `3px solid ${colors.line}`,
      boxSizing: 'border-box',
      boxShadow: '0 20px 40px rgba(18,38,58,0.08)',
      ...style,
    }}
  />
);

// Пунктирный контур на месте потерянного зуба
export const ToothGhost: React.FC<{ x: number; cy: number; opacity: number }> = ({
  x,
  cy,
  opacity,
}) => (
  <svg
    width={TOOTH_W}
    height={TOOTH_H}
    style={{ position: 'absolute', left: x, top: cy - TOOTH_H / 2, opacity, overflow: 'visible' }}
  >
    <rect
      x={1.5}
      y={1.5}
      width={TOOTH_W - 3}
      height={TOOTH_H - 3}
      rx={38.5}
      fill="none"
      stroke={colors.gold}
      strokeWidth={3}
      strokeDasharray="10 10"
    />
  </svg>
);
