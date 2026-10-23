import { IconBrandInstagram } from '@tabler/icons-react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { D, D_DURATION, D_FPS, DS, SECTION_NAMES, type DScene, clamp, easeOut } from './theme';
import { t } from './ui';
import { mono } from '../fonts';

const pad = (n: number, l = 2) => String(Math.floor(n)).padStart(l, '0');

const SAFE = { x0: 80, x1: 1000, y0: 250, y1: 1540 };
const SCENES = Object.keys(DS) as DScene[];

export const DynamicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.35) % 120;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 18%, ${D.bg0} 0%, ${D.bg1} 100%)` }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          backgroundPosition: `0 ${drift}px`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 700,
          top: 1500 - 500,
          width: 1400,
          height: 1000,
          background: `radial-gradient(closest-side, ${D.indigo}33, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Постоянный слой HUD: таймер-обратный отсчёт, ник, уголки, микротекст, прогресс
export const Hud: React.FC<{ handle: string }> = ({ handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scene = [...SCENES].reverse().find((s) => frame >= DS[s].from) ?? 'hook';
  const sceneIdx = SCENES.indexOf(scene);

  const secLeft = Math.max(0, 60 - frame / D_FPS);
  const shown = Math.ceil(secLeft);
  const timer = `${pad(shown / 60)}:${pad(shown % 60)}`;

  const intro = interpolate(frame, [96, 108], [0, 1], { ...clamp, easing: easeOut });
  const ringIn = spring({ frame: frame - 96, fps, config: { damping: 13, mass: 0.7, stiffness: 140 } });
  const fadeOut = interpolate(frame, [D_DURATION - 24, D_DURATION - 4], [1, 0], clamp);

  const R = 38;
  const C = 2 * Math.PI * R;
  const tc = `00:${pad(frame / D_FPS)}:${pad(frame % D_FPS)}`;

  const dot = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: fadeOut }}>
      {/* Уголки безопасной зоны */}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: 0.55 }}>
        {[
          [SAFE.x0, SAFE.y0, 1, 1],
          [SAFE.x1, SAFE.y0, -1, 1],
          [SAFE.x0, SAFE.y1, 1, -1],
          [SAFE.x1, SAFE.y1, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M${x} ${y + sy * 30} V${y} H${x + sx * 30}`} stroke={D.lime} strokeWidth={2} fill="none" />
        ))}
      </svg>

      {/* Верхний микротекст */}
      <div style={{ ...t.mono, position: 'absolute', left: SAFE.x0, top: 214, fontSize: 20, opacity: intro }}>
        {tc} · 1080×1920 · 30 К/С
      </div>

      {/* Ник слева, таймер-кольцо справа */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.x0,
          top: 270,
          height: 96,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          opacity: intro,
        }}
      >
        <IconBrandInstagram size={40} stroke={1.6} color={D.white} />
        <span style={{ fontFamily: mono, fontSize: 30, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
          {handle}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: SAFE.x1 - 200,
          top: 270,
          width: 200,
          height: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          opacity: intro,
          transform: `scale(${0.7 + 0.3 * ringIn})`,
          transformOrigin: 'right center',
        }}
      >
        <svg width={96} height={96} style={{ position: 'absolute', right: 0 }}>
          <circle cx={48} cy={48} r={R} fill="rgba(2,23,51,0.7)" stroke={D.faint} strokeWidth={4} />
          <circle
            cx={48}
            cy={48}
            r={R}
            fill="none"
            stroke={D.lime}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - secLeft / 60)}
            transform="rotate(-90 48 48)"
            style={{ filter: `drop-shadow(0 0 6px ${D.glow})` }}
          />
        </svg>
        <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 19, color: D.white, position: 'absolute', right: 10, width: 76, textAlign: 'center' }}>
          {timer}
        </span>
        <span
          style={{
            ...t.mono,
            position: 'absolute',
            right: 112,
            fontSize: 18,
            color: D.lime,
            opacity: dot ? 1 : 0.35,
          }}
        >
          ● ОСТАЛОСЬ
        </span>
      </div>

      {/* Нижний прогресс и название части */}
      <div style={{ position: 'absolute', left: SAFE.x0, top: 1572, width: SAFE.x1 - SAFE.x0, height: 4, background: D.faint, opacity: intro }}>
        <div
          style={{
            width: `${(frame / D_DURATION) * 100}%`,
            height: '100%',
            background: D.lime,
            boxShadow: `0 0 12px ${D.glow}`,
          }}
        />
      </div>
      <div style={{ ...t.mono, position: 'absolute', left: SAFE.x0, top: 1590, fontSize: 20, opacity: intro }}>
        ЧАСТЬ {sceneIdx + 1}/{SCENES.length} · {SECTION_NAMES[scene]}
      </div>
      <div style={{ ...t.mono, position: 'absolute', right: 1080 - SAFE.x1, top: 1590, fontSize: 20, opacity: intro }}>
        32 КАРАТА
      </div>
    </AbsoluteFill>
  );
};
