import { IconHourglass } from '@tabler/icons-react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { IconPop } from '../components/IconPop';
import { CenterAt } from '../components/Positioned';
import { RevealWord } from '../components/RevealWord';
import { SceneExit } from '../components/SceneExit';
import { clamp, colors, easeOut } from '../theme';
import { type } from '../typography';

// Подчёркивание под «25%» (480…600, y = 1050) рисует проводник (G10, локально 12–22).
// Цифру «до 25% в первый год» перед публикацией согласовать с врачом клиники.
export const S4Stat: React.FC = () => {
  const frame = useCurrentFrame();
  const count = interpolate(frame, [4, 40], [0, 25], { ...clamp, easing: easeOut });
  const scale = interpolate(frame, [4, 40], [0.92, 1], { ...clamp, easing: easeOut });
  const fadeDo = interpolate(frame, [2, 14], [0, 1], clamp);

  return (
    <SceneExit from={62} to={72}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', left: 540 - 28, top: 560 - 28, width: 56, height: 56 }}>
          <IconPop delay={0}>
            <IconHourglass size={56} stroke={1.5} color={colors.gold} />
          </IconPop>
        </div>
        <CenterAt y={640} style={{ ...type.body, color: colors.muted, opacity: fadeDo }}>
          до
        </CenterAt>
        <CenterAt y={860} style={{ ...type.stat, fontVariantNumeric: 'tabular-nums', transform: `translateY(-50%) scale(${scale})` }}>
          {Math.round(count)}%
        </CenterAt>
        <CenterAt y={1140} style={{ ...type.body }}>
          <RevealWord delay={26}>
            объёма кости может уйти
            <br />в первый год после удаления зуба
          </RevealWord>
        </CenterAt>
      </AbsoluteFill>
    </SceneExit>
  );
};
