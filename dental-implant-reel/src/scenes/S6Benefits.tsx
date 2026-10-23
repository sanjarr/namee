import { IconCalendarCheck, IconShieldCheck, IconSparkles, type Icon } from '@tabler/icons-react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { iconPopProgress } from '../components/IconPop';
import { CenterAt } from '../components/Positioned';
import { clamp, colors, easeIn, easeOut } from '../theme';
import { type } from '../typography';

const PHRASES: { from: number; to: number; text: string; icon: Icon }[] = [
  // ~1,6 с на фразу из 2–3 слов
  { from: 14, to: 64, text: 'Выглядит естественно', icon: IconSparkles },
  { from: 64, to: 113, text: 'Сохраняет кость', icon: IconShieldCheck },
  { from: 113, to: 162, text: 'Служит долгие годы', icon: IconCalendarCheck },
];

const Phrase: React.FC<(typeof PHRASES)[number]> = ({ from, to, text, icon: IconComponent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame >= to) return null;

  const enter = interpolate(frame, [from, from + 8], [0, 1], { ...clamp, easing: easeOut });
  const exit = interpolate(frame, [to - 6, to], [0, 1], { ...clamp, easing: easeIn });
  const pop = iconPopProgress(frame, fps, from);
  const iconExit = interpolate(frame, [to - 5, to], [0, 1], clamp);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 540 - 28,
          top: 720 - 28,
          width: 56,
          height: 56,
          opacity: pop * (1 - iconExit),
          transform: `scale(${(0.6 + 0.4 * pop) * (1 - 0.4 * iconExit)}) rotate(${-10 * (1 - pop)}deg)`,
        }}
      >
        <IconComponent size={56} stroke={1.5} color={colors.accent} />
      </div>
      <CenterAt
        y={930}
        style={{
          ...type.h2,
          left: 60,
          right: 60,
          opacity: enter * (1 - exit),
          transform: `translateY(calc(-50% + ${30 * (1 - enter) - 30 * exit}px))`,
          filter: `blur(${6 * (1 - enter)}px)`,
        }}
      >
        {text}
      </CenterAt>
    </>
  );
};

// Круг (центр 540, 720, r = 60) рисует проводник (G15), затем кружит по орбите (G16)
export const S6Benefits: React.FC = () => (
  <AbsoluteFill>
    {PHRASES.map((p) => (
      <Phrase key={p.text} {...p} />
    ))}
  </AbsoluteFill>
);
