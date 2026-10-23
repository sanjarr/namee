import { measureText } from '@remotion/layout-utils';
import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { family, font, mono } from '../fonts';
import { D, clamp, easeIn, easeInOut, easeOut } from './theme';

type Easing = (t: number) => number;

export const prog = (frame: number, from: number, dur: number, easing: Easing = easeOut) =>
  interpolate(frame, [from, from + dur], [0, 1], { ...clamp, easing });

// Ширина текста в Ubuntu; нужна для зачёркиваний и для вписывания в безопасную зону
export const textWidth = (text: string, size: number, weight = 700, letterSpacing?: string) =>
  measureText({
    text,
    fontFamily: family,
    fontSize: size,
    fontWeight: weight,
    letterSpacing,
    textTransform: 'uppercase',
    validateFontIsLoaded: false,
  }).width;

export const useFit = (text: string, maxWidth: number, base: number, weight = 700) =>
  useMemo(() => {
    const w = textWidth(text, base, weight, '-0.01em');
    return w > maxWidth ? Math.floor((base * maxWidth) / w) : base;
  }, [text, maxWidth, base, weight]);

export const t = {
  head: {
    fontFamily: font,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '-0.01em',
    lineHeight: 1.05,
    color: D.white,
  },
  label: {
    fontFamily: font,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.24em',
    color: D.lime,
  },
  mono: {
    fontFamily: mono,
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: D.dim,
  },
} satisfies Record<string, CSSProperties>;

// Блок на всю ширину кадра, центр по вертикали — y
export const Center: React.FC<{ y: number; style?: CSSProperties; children: ReactNode }> = ({
  y,
  style,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: y,
      transform: 'translateY(-50%)',
      textAlign: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);

// Строка выезжает из-под маски (translateY 110% → 0), на выходе уезжает вверх
export const Mask: React.FC<{
  delay: number;
  exitAt?: number;
  dur?: number;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ delay, exitAt, dur = 14, style, children }) => {
  const frame = useCurrentFrame();
  const enter = prog(frame, delay, dur);
  const exit = exitAt === undefined ? 0 : prog(frame, exitAt, 8, easeIn);
  return (
    <div style={{ overflow: 'hidden', padding: '0.14em 0', margin: '-0.14em 0', ...style }}>
      <div
        style={{
          transform: `translateY(${(1 - enter) * 110 - exit * 110}%)`,
          opacity: 1 - exit * 0.6,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Жёлтая плашка с тёмным текстом — главный приём референса
export const Slab: React.FC<{
  text: string;
  y: number;
  size: number;
  delay: number;
  exitAt?: number;
  scale?: number;
  rotate?: number;
}> = ({ text, y, size, delay, exitAt, scale = 1, rotate = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = prog(frame, delay, 12);
  const pop = spring({ frame: frame - delay, fps, config: { damping: 11, mass: 0.7, stiffness: 150 } });
  const exit = exitAt === undefined ? 0 : prog(frame, exitAt, 8, easeIn);
  if (frame < delay) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale * (0.9 + 0.1 * pop)}, ${
          scale * (0.9 + 0.1 * pop) * (1 - exit)
        })`,
        opacity: 1 - exit * 0.5,
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: `${size * 0.17}px ${size * 0.42}px`,
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: D.lime,
            borderRadius: size * 0.18,
            borderBottom: `${Math.max(6, size * 0.07)}px solid ${D.limeDeep}`,
            boxShadow: `0 0 ${size * 0.55}px ${D.glow}`,
            transformOrigin: 'left center',
            transform: `scaleX(${wipe})`,
          }}
        />
        <div style={{ position: 'relative', overflow: 'hidden', padding: '0.06em 0' }}>
          <div
            style={{
              ...t.head,
              fontSize: size,
              color: D.ink,
              lineHeight: 1,
              transform: `translateY(${(1 - prog(frame, delay + 5, 12)) * 105}%)`,
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

// Подсветка слова «маркером»: жёлтая полоса вытягивается, текст темнеет
export const Hl: React.FC<{ delay: number; children: ReactNode }> = ({ delay, children }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 10);
  return (
    <span style={{ position: 'relative', display: 'inline-block', padding: '0 0.16em', margin: '0 -0.02em' }}>
      <span
        style={{
          position: 'absolute',
          inset: '0.04em 0 0.0em',
          background: D.lime,
          borderRadius: '0.12em',
          boxShadow: p > 0.05 ? `0 0 0.5em ${D.glow}` : undefined,
          transformOrigin: 'left center',
          transform: `scaleX(${p})`,
        }}
      />
      <span style={{ position: 'relative', color: interpolateColors(p, [0, 1], [D.white, D.ink]) }}>
        {children}
      </span>
    </span>
  );
};

export type Seg = { text: string; hl?: boolean };

// Печатная машинка с подсветкой ключевых слов после набора
export const Typed: React.FC<{
  segs: Seg[];
  delay: number;
  cps?: number;
  cursor?: boolean;
}> = ({ segs, delay, cps = 26, cursor = true }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.floor(((frame - delay) * cps) / 30));
  const total = segs.reduce((n, s) => n + s.text.length, 0);
  let offset = 0;
  const parts = segs.map((s, i) => {
    const start = offset;
    offset += s.text.length;
    const visible = s.text.slice(0, Math.max(0, shown - start));
    if (s.hl) {
      const doneAt = delay + Math.ceil(((start + s.text.length) * 30) / cps) + 2;
      return (
        <Hl key={i} delay={doneAt}>
          {visible || ' '}
        </Hl>
      );
    }
    return <span key={i}>{visible}</span>;
  });
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <>
      {parts}
      {cursor && shown < total + 20 && frame >= delay ? (
        <span style={{ color: D.lime, opacity: blink ? 1 : 0, marginLeft: 4 }}>▍</span>
      ) : null}
    </>
  );
};

const FILTERS = (
  <defs>
    <filter id="d-blur8" filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
      <feGaussianBlur stdDeviation={8} />
    </filter>
    <filter id="d-blur2" filterUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
      <feGaussianBlur stdDeviation={2} />
    </filter>
  </defs>
);

// Линия-зачёркивание с неоновым свечением; рисуется слева направо
export const Strike: React.FC<{
  x0: number;
  x1: number;
  y: number;
  delay: number;
  dur?: number;
  weight?: number;
}> = ({ x0, x1, y, delay, dur = 10, weight = 1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, easeInOut);
  if (frame < delay) return null;
  const x = x0 + (x1 - x0) * p;
  const headFade = 1 - prog(frame, delay + dur, 8);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      {FILTERS}
      <line x1={x0} y1={y} x2={x} y2={y} stroke={D.lime} strokeWidth={22 * weight} strokeLinecap="round" opacity={0.4} filter="url(#d-blur8)" />
      <line x1={x0} y1={y} x2={x} y2={y} stroke={D.lime} strokeWidth={9 * weight} strokeLinecap="round" opacity={0.85} filter="url(#d-blur2)" />
      <line x1={x0} y1={y} x2={x} y2={y} stroke="#F6FFC4" strokeWidth={4.5 * weight} strokeLinecap="round" />
      <circle cx={x} cy={y} r={9 * weight} fill="#FFFFFF" opacity={headFade} filter="url(#d-blur2)" />
    </svg>
  );
};

// Уголки HUD-рамки вокруг блока
export const Brackets: React.FC<{ x: number; y: number; w: number; h: number; size?: number; opacity?: number }> = ({
  x,
  y,
  w,
  h,
  size = 26,
  opacity = 0.7,
}) => {
  const c = { stroke: D.lime, strokeWidth: 2.5, fill: 'none', opacity } as const;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
      <path d={`M${x} ${y + size} V${y} H${x + size}`} {...c} />
      <path d={`M${x + w - size} ${y} H${x + w} V${y + size}`} {...c} />
      <path d={`M${x + w} ${y + h - size} V${y + h} H${x + w - size}`} {...c} />
      <path d={`M${x + size} ${y + h} H${x} V${y + h - size}`} {...c} />
    </svg>
  );
};
