import type { CSSProperties, ReactNode } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { softSpring } from '../theme';

export const iconPopProgress = (frame: number, fps: number, delay: number) =>
  spring({ frame: frame - delay, fps, config: softSpring, durationInFrames: 12 });

// scale 0.6→1, rotate −10°→0, opacity 0→1, softSpring ~12 кадров
export const IconPop: React.FC<{ delay?: number; style?: CSSProperties; children: ReactNode }> = ({
  delay = 0,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = iconPopProgress(frame, fps, delay);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: t,
        transform: `scale(${0.6 + 0.4 * t}) rotate(${-10 * (1 - t)}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
