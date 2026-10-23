import type { CSSProperties, ReactNode } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp, easeOut } from '../theme';

// opacity 0→1, translateY 60→0, blur 8px→0 за 18 кадров
export const RevealWord: React.FC<{
  delay?: number;
  duration?: number;
  distance?: number;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ delay = 0, duration = 18, distance = 60, style, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + duration], [0, 1], { ...clamp, easing: easeOut });
  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        opacity: t,
        transform: `translateY(${(1 - t) * distance}px)`,
        filter: `blur(${(1 - t) * 8}px)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Строка, раскрывающаяся по словам: delays[i] — задержка i-го слова.
export const RevealWords: React.FC<{
  words: { text: string; style?: CSSProperties }[];
  delays: number[];
}> = ({ words, delays }) => (
  <>
    {words.map((w, i) => (
      <span key={i}>
        {i > 0 ? ' ' : null}
        <RevealWord delay={delays[i]} style={w.style}>
          {w.text}
        </RevealWord>
      </span>
    ))}
  </>
);
