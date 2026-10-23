import { IconDental } from '@tabler/icons-react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IconPop } from '../components/IconPop';
import { IMPLANT, Implant } from '../components/Implant';
import { AnimatedLabel } from '../components/Label';
import { CenterAt } from '../components/Positioned';
import { RevealWord } from '../components/RevealWord';
import { SceneExit } from '../components/SceneExit';
import type { Layout } from '../layout';
import { bounceSpring, clamp, colors, easeOut } from '../theme';
import { type } from '../typography';

const TITLE = 'Имплантация';
// Точка, где растворяется мини-имплантат проводника (G12)
const MORPH_Y = 1250;

export const S5Solution: React.FC<{ layout: Layout }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = (from: number, to: number) =>
    interpolate(frame, [from, to], [0, 1], { ...clamp, easing: easeOut });

  const gum = ease(14, 30);
  const screw = ease(20, 32);
  const abut = ease(34, 52);
  const crown = spring({ frame: frame - 48, fps, config: bounceSpring });
  const crownOpacity = interpolate(frame, [48, 54], [0, 1], clamp);
  const wave = interpolate(frame, [70, 92], [0, 1], { ...clamp, easing: easeOut });

  const crownCy = IMPLANT.crown.top + IMPLANT.crown.height / 2;

  return (
    <SceneExit from={150} to={162}>
      <AbsoluteFill>
        <CenterAt y={360}>
          <AnimatedLabel
            text="Решение"
            before={
              <IconPop delay={0}>
                <IconDental size={36} stroke={1.5} color={colors.accent} />
              </IconPop>
            }
          />
        </CenterAt>

        <CenterAt y={480} style={{ ...type.h1, fontSize: layout.sizes.s5Title, whiteSpace: 'nowrap', left: 0, right: 0 }}>
          {TITLE.split('').map((ch, i) => {
            const t = ease(6 + i * 2, 6 + i * 2 + 16);
            return (
              <span
                key={i}
                style={{ display: 'inline-block', opacity: t, transform: `translateY(${40 * (1 - t)}px)` }}
              >
                {ch}
              </span>
            );
          })}
        </CenterAt>

        <CenterAt y={650} style={{ ...type.body, color: colors.muted }}>
          <RevealWord delay={28}>
            новый корень вместо
            <br />
            утраченного зуба
          </RevealWord>
        </CenterAt>

        <Implant
          parts={{
            gum: { opacity: gum, scaleX: 0.6 + 0.4 * gum },
            screw: { opacity: screw, scale: 0.3 + 0.7 * screw, originY: MORPH_Y },
            abutment: { opacity: abut, dy: -80 * (1 - abut) },
            crown: { opacity: crownOpacity, dy: -260 * (1 - crown) },
          }}
        />

        {/* Волна вокруг коронки, кадр 70 */}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <circle
            cx={IMPLANT.cx}
            cy={crownCy}
            r={150 * (0.8 + 0.8 * wave)}
            fill="none"
            stroke={colors.accent}
            strokeWidth={2}
            opacity={frame >= 70 ? 0.8 * (1 - wave) : 0}
          />
        </svg>
      </AbsoluteFill>
    </SceneExit>
  );
};
