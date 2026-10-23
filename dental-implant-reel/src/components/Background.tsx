import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { DURATION, clamp, colors, easeInOut } from '../theme';

const Spot: React.FC<{
  color: string;
  diameter: number;
  from: [number, number];
  to: [number, number];
}> = ({ color, diameter, from, to }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, DURATION], [0, 1], { ...clamp, easing: easeInOut });
  const cx = from[0] + (to[0] - from[0]) * t;
  const cy = from[1] + (to[1] - from[1]) * t;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - diameter / 2,
        top: cy - diameter / 2,
        width: diameter,
        height: diameter,
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${color} 0%, ${color}00 70%)`,
      }}
    />
  );
};

export const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: 'hidden' }}>
    <Spot color={colors.ice} diameter={1400} from={[900, 300]} to={[780, 460]} />
    <Spot color={colors.champagne} diameter={1200} from={[150, 1650]} to={[280, 1480]} />
  </AbsoluteFill>
);
