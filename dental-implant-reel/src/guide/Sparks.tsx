import { interpolate, random } from 'remotion';
import { clamp, colors, easeOut } from '../theme';
import type { Leg } from './legs';
import { guidePosition } from './state';

const LIFE = 18;

// Во время полёта каждые 3 кадра рождается искра; дрейфует против
// направления движения на 20–40 px и гаснет за 18 кадров.
export const Sparks: React.FC<{ legs: Leg[]; frame: number }> = ({ legs, frame }) => {
  const sparks: React.ReactNode[] = [];
  for (const leg of legs) {
    if (leg.kind !== 'fly') continue;
    if (frame < leg.start || frame > leg.end + LIFE) continue;
    for (let b = leg.start; b < leg.end; b += 3) {
      const age = frame - b;
      if (age < 0 || age >= LIFE) continue;
      const i = b;
      const [x, y] = guidePosition(legs, b);
      const [px, py] = guidePosition(legs, b - 1);
      let vx = x - px;
      let vy = y - py;
      const len = Math.hypot(vx, vy) || 1;
      vx /= len;
      vy /= len;
      const drift = 20 + 20 * random(`spark-${i}-drift`);
      const size = 3 + 2 * random(`spark-${i}-size`);
      const side = (random(`spark-${i}-side`) - 0.5) * 16;
      const color = random(`spark-${i}-color`) < 0.5 ? colors.yellow : colors.glow;
      const t = interpolate(age, [0, LIFE], [0, 1], { ...clamp, easing: easeOut });
      const cx = x - vx * drift * t - vy * side * t;
      const cy = y - vy * drift * t + vx * side * t;
      sparks.push(
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={(size / 2) * (1 - 0.4 * t)}
          fill={color}
          opacity={1 - age / LIFE}
        />,
      );
    }
  }
  return <g filter="url(#spark-glow)">{sparks}</g>;
};
