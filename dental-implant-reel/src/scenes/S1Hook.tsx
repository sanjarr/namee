import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CenterAt } from '../components/Positioned';
import { RevealWord } from '../components/RevealWord';
import { SceneExit } from '../components/SceneExit';
import { TOOTH_W, Tooth, ToothGhost } from '../components/Tooth';
import type { Layout } from '../layout';
import { clamp, easeInOut, softSpring } from '../theme';
import { type } from '../typography';

const ROW_Y = 1180;
const FIRST_X = 217;
const GAP = 24;
const MISSING = 2;

export const S1Hook: React.FC<{ layout: Layout }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lost = interpolate(frame, [36, 54], [0, 1], { ...clamp, easing: easeInOut });

  return (
    <SceneExit from={62} to={72}>
      <AbsoluteFill>
        <CenterAt y={800} style={{ ...type.h1 }}>
          <div style={{ fontSize: layout.sizes.s1Line1 }}>
            <RevealWord delay={4}>Нет</RevealWord> <RevealWord delay={13}>одного</RevealWord>
          </div>
          <div style={{ fontSize: layout.sizes.s1Line2 }}>
            <RevealWord delay={22} style={type.accent}>
              зуба?
            </RevealWord>
          </div>
        </CenterAt>

        {Array.from({ length: 5 }, (_, i) => {
          const x = FIRST_X + i * (TOOTH_W + GAP);
          const s = spring({ frame: frame - (2 + i * 3), fps, config: softSpring, durationInFrames: 18 });
          const isMissing = i === MISSING;
          return (
            <Tooth
              key={i}
              x={x}
              cy={ROW_Y}
              style={{
                opacity: s * (isMissing ? 1 - lost : 1),
                transform: `translateY(${isMissing ? 20 * lost : 0}px) scale(${0.8 + 0.2 * s})`,
              }}
            />
          );
        })}
        <ToothGhost x={FIRST_X + MISSING * (TOOTH_W + GAP)} cy={ROW_Y} opacity={lost} />
      </AbsoluteFill>
    </SceneExit>
  );
};
