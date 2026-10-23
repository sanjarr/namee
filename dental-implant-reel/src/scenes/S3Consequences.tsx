import { IconArrowsHorizontal, IconDentalBroken, IconTrendingDown, type Icon } from '@tabler/icons-react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { IconBadge } from '../components/IconBadge';
import { AnimatedLabel } from '../components/Label';
import { MaskReveal } from '../components/MaskReveal';
import { CenterAt } from '../components/Positioned';
import { SceneExit } from '../components/SceneExit';
import { clamp, colors, easeOut } from '../theme';
import { font } from '../fonts';
import { type } from '../typography';

const ITEMS: { num: string; text: string; sep: number; draw: number; icon: Icon }[] = [
  { num: '01', text: 'Соседние зубы смещаются в пустоту', sep: 520, draw: 12, icon: IconArrowsHorizontal },
  { num: '02', text: 'Костная ткань постепенно убывает', sep: 820, draw: 42, icon: IconTrendingDown },
  { num: '03', text: 'Нарушается прикус и нагрузка при жевании', sep: 1120, draw: 72, icon: IconDentalBroken },
];

const Item: React.FC<(typeof ITEMS)[number]> = ({ num, text, sep, draw, icon }) => {
  const frame = useCurrentFrame();
  const n = interpolate(frame, [draw + 6, draw + 24], [0, 1], { ...clamp, easing: easeOut });
  const top = sep + 40;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top,
          fontFamily: font,
          fontWeight: 300,
          fontSize: 64,
          lineHeight: 1,
          color: colors.gold,
          opacity: n,
          transform: `translateX(${-40 * (1 - n)}px)`,
        }}
      >
        {num}
      </div>
      <MaskReveal delay={draw + 10} style={{ position: 'absolute', left: 240, top, width: 600 }}>
        <div style={{ ...type.body, maxHeight: 42 * 1.35 * 2 + 2 }}>{text}</div>
      </MaskReveal>
      <IconBadge icon={icon} diameter={80} cx={920} cy={sep + 100} delay={draw + 4} />
    </>
  );
};

// Разделители 01–03 рисует проводник (G4, G6, G8)
export const S3Consequences: React.FC = () => (
  <SceneExit from={132} to={144}>
    <AbsoluteFill>
      <CenterAt y={380}>
        <AnimatedLabel text="Что происходит" />
      </CenterAt>
      {ITEMS.map((item) => (
        <Item key={item.num} {...item} />
      ))}
    </AbsoluteFill>
  </SceneExit>
);
