import type { Icon } from '@tabler/icons-react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, softSpring } from '../theme';
import { IconPop } from './IconPop';

export const IconBadge: React.FC<{
  icon: Icon;
  diameter: number;
  cx: number;
  cy: number;
  delay?: number;
  color?: string;
}> = ({ icon: IconComponent, diameter, cx, cy, delay = 0, color = colors.ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - delay, fps, config: softSpring, durationInFrames: 14 });
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - diameter / 2,
        top: cy - diameter / 2,
        width: diameter,
        height: diameter,
        borderRadius: '50%',
        backgroundColor: colors.surface,
        border: `1.5px solid ${colors.line}`,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: t,
        transform: `scale(${0.8 + 0.2 * t})`,
      }}
    >
      <IconPop delay={delay + 4}>
        <IconComponent size={diameter * 0.45} stroke={1.5} color={color} />
      </IconPop>
    </div>
  );
};
