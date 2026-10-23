import { interpolate } from 'remotion';
import { ctaPulse, ctaScale, CTA_CENTER } from '../cta';
import { clamp, colors, easeIn, easeOut } from '../theme';
import type { PathLeg } from './legs';
import { legProgress, pathLength } from './state';

const TAIL = 240;
const SLICES = 8;

const LAYERS = [
  { key: 'halo', width: 18, color: colors.glow, opacity: 0.4, filter: 'url(#glow-halo)' },
  { key: 'mid', width: 6, color: colors.accent, opacity: 0.7, filter: 'url(#glow-mid)' },
  { key: 'core', width: 3, color: colors.accentDeep, opacity: 1, filter: undefined },
] as const;

type LayerKey = (typeof LAYERS)[number]['key'];

// Отрезок пути [from, to] через strokeDasharray / strokeDashoffset
const Segment: React.FC<{
  d: string;
  total: number;
  from: number;
  to: number;
  width: number;
  color: string;
  opacity: number;
  cap: 'round' | 'butt';
}> = ({ d, total, from, to, width, color, opacity, cap }) => {
  if (to - from < 0.5 || opacity <= 0.001) return null;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap={cap}
      strokeLinejoin="round"
      strokeDasharray={`${to - from} ${total * 2 + 10}`}
      strokeDashoffset={-from}
      opacity={opacity}
    />
  );
};

export const glowLegVisible = (leg: PathLeg, frame: number) => {
  if (frame < leg.start) return false;
  if (leg.kind === 'fly') return frame <= leg.end + 8;
  return leg.livesUntil === null || frame <= leg.livesUntil[1];
};

export const GlowPath: React.FC<{ leg: PathLeg; frame: number }> = ({ leg, frame }) => {
  const total = pathLength(leg.path);
  const head = total * legProgress(leg, frame);

  if (leg.kind === 'fly') {
    // Хвост-комета 240 px из 8 срезов, гаснет за 8 кадров после конца сегмента
    const fade = interpolate(frame, [leg.end, leg.end + 8], [1, 0], clamp);
    const tailStart = Math.max(0, head - TAIL);
    const step = (head - tailStart) / SLICES;
    return (
      <g>
        {LAYERS.map((layer) => (
          <g key={layer.key} filter={layer.filter}>
            {Array.from({ length: SLICES }, (_, i) => (
              <Segment
                key={i}
                d={leg.path}
                total={total}
                from={tailStart + step * i}
                to={tailStart + step * (i + 1) + (i < SLICES - 1 ? 0.6 : 0)}
                width={layer.width}
                color={layer.color}
                opacity={layer.opacity * fade * ((i + 1) / SLICES)}
                cap={i === SLICES - 1 ? 'round' : 'butt'}
              />
            ))}
          </g>
        ))}
      </g>
    );
  }

  // draw: линия от начала пути до имплантата; после конца сегмента ореол и
  // средний слой гаснут за 14 кадров, ядро остаётся элементом сцены
  const glow = interpolate(frame, [leg.end, leg.end + 14], [1, 0], { ...clamp, easing: easeOut });
  const pulse = leg.pulse ? ctaPulse(frame) : 0;
  const core = leg.livesUntil
    ? interpolate(frame, leg.livesUntil, [1, 0], { ...clamp, easing: easeIn })
    : 1;
  const layerOpacity: Record<LayerKey, number> = {
    halo: Math.max(0.4 * glow, 0.6 * pulse) * core,
    mid: Math.max(0.7 * glow, 0.6 * pulse) * core,
    core,
  };
  const s = leg.pulse ? ctaScale(frame) : 1;
  const transform =
    s !== 1
      ? `translate(${CTA_CENTER.x} ${CTA_CENTER.y}) scale(${s}) translate(${-CTA_CENTER.x} ${-CTA_CENTER.y})`
      : undefined;

  return (
    <g transform={transform}>
      {LAYERS.map((layer) => (
        <g key={layer.key} filter={layer.filter}>
          <Segment
            d={leg.path}
            total={total}
            from={0}
            to={head}
            width={layer.width}
            color={layer.color}
            opacity={layerOpacity[layer.key]}
            cap="round"
          />
        </g>
      ))}
    </g>
  );
};

// Фильтры в координатах кадра: у горизонтальных линий bbox нулевой высоты,
// поэтому objectBoundingBox не подходит.
export const GlowFilters: React.FC = () => (
  <defs>
    <filter id="glow-halo" filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
      <feGaussianBlur stdDeviation={8} />
    </filter>
    <filter id="glow-mid" filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
      <feGaussianBlur stdDeviation={2} />
    </filter>
    <filter id="spark-glow" filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
      <feDropShadow dx={0} dy={0} stdDeviation={1.5} floodColor={colors.accentDeep} floodOpacity={0.45} />
    </filter>
  </defs>
);
