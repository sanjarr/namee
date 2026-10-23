import { IconCalendarCheck, IconShieldCheck, IconSparkles, type Icon } from '@tabler/icons-react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneExit } from '../../components/SceneExit';
import { D, DS, clamp, easeOut } from '../theme';
import { Center, Hl, Mask, prog, t } from '../ui';

const ROWS: { text: string; icon: Icon; delay: number; y: number }[] = [
  { text: 'ЕСТЕСТВЕННЫЙ ВИД', icon: IconSparkles, delay: 28, y: 760 },
  { text: 'СОХРАНЯЕТ КОСТЬ', icon: IconShieldCheck, delay: 68, y: 960 },
  { text: 'СЛУЖИТ ГОДАМИ', icon: IconCalendarCheck, delay: 108, y: 1160 },
];

const Row: React.FC<(typeof ROWS)[number]> = ({ text, icon: IconComponent, delay, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = prog(frame, delay, 14);
  const tick = interpolate(frame, [delay + 12, delay + 24], [0, 1], { ...clamp, easing: easeOut });
  const pop = spring({ frame: frame - delay - 12, fps, config: { damping: 10, mass: 0.6, stiffness: 160 } });
  if (frame < delay) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        top: y - 80,
        width: 900,
        height: 160,
        borderRadius: 24,
        background: D.panel,
        border: `1.5px solid ${tick > 0.5 ? 'rgba(222,255,92,0.55)' : D.faint}`,
        opacity: enter,
        transform: `translateX(${(1 - enter) * -70}px)`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 36px',
        gap: 30,
        boxSizing: 'border-box',
      }}
    >
      <svg width={84} height={84} style={{ flex: 'none', overflow: 'visible' }}>
        <rect x={3} y={3} width={78} height={78} rx={20} fill={tick > 0.2 ? D.lime : 'none'} stroke={D.lime} strokeWidth={3} style={{ filter: `drop-shadow(0 0 10px ${D.glow})` }} />
        <path
          d="M22 44 L37 59 L63 28"
          fill="none"
          stroke={D.ink}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={70}
          strokeDashoffset={70 * (1 - tick)}
          transform={`scale(${0.8 + 0.2 * pop})`}
          style={{ transformOrigin: '42px 42px' }}
        />
      </svg>
      <div style={{ ...t.head, fontSize: 56, whiteSpace: 'nowrap', flex: 1 }}>{text}</div>
      <IconComponent size={64} stroke={1.5} color={D.lime} style={{ flex: 'none', opacity: tick }} />
    </div>
  );
};

export const D7Benefits: React.FC = () => (
  <SceneExit from={DS.benefits.duration - 8} to={DS.benefits.duration}>
    <AbsoluteFill>
      <Center y={470} style={{ ...t.head, fontSize: 64 }}>
        <Mask delay={0}>
          ИМПЛАНТ — ЭТО <Hl delay={14}>НАДОЛГО</Hl>
        </Mask>
      </Center>
      <Center y={560} style={{ ...t.mono, fontSize: 22 }}>
        <Mask delay={10}>{'// ЧЕК-ЛИСТ'}</Mask>
      </Center>
      {ROWS.map((r) => (
        <Row key={r.text} {...r} />
      ))}
    </AbsoluteFill>
  </SceneExit>
);
