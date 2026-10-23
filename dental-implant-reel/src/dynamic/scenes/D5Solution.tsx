import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { IMPLANT, Implant } from '../../components/Implant';
import { SceneExit } from '../../components/SceneExit';
import { bounceSpring } from '../../theme';
import { D, DS, clamp, easeInOut, easeOut } from '../theme';
import { Brackets, Center, Mask, Slab, prog, t, useFit } from '../ui';

const A = 64; // начало сборки имплантата (локальный кадр сцены)
const MORPH_Y = 1250;

const Callout: React.FC<{ text: string; n: number; y: number; fromX: number; delay: number }> = ({
  text,
  n,
  y,
  fromX,
  delay,
}) => {
  const frame = useCurrentFrame();
  const line = prog(frame, delay, 12);
  const txt = prog(frame, delay + 6, 12);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={`M${fromX} ${y} H${fromX + (690 - fromX) * line}`} stroke={D.lime} strokeWidth={2.5} />
        <circle cx={fromX} cy={y} r={7} fill={D.lime} opacity={line} style={{ filter: `drop-shadow(0 0 6px ${D.glow})` }} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 706,
          top: y - 50,
          opacity: txt,
          transform: `translateX(${(1 - txt) * 24}px)`,
        }}
      >
        <div style={{ ...t.mono, fontSize: 20, color: D.lime }}>ЭТАП {n}/3</div>
        <div style={{ ...t.head, fontSize: 38, whiteSpace: 'nowrap' }}>{text}</div>
      </div>
    </>
  );
};

export const D5Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const size = useFit('ИМПЛАНТАЦИЯ', 880, 150);

  const move = prog(frame, 60, 18, easeInOut);
  const slabY = 860 + (500 - 860) * move;
  const slabScale = 1 - 0.34 * move;

  const e = (from: number, to: number) =>
    interpolate(frame, [A + from, A + to], [0, 1], { ...clamp, easing: easeOut });
  const gum = e(14, 30);
  const screw = e(20, 32);
  const abut = e(34, 52);
  const crown = spring({ frame: frame - (A + 48), fps, config: bounceSpring });
  const crownOpacity = interpolate(frame, [A + 48, A + 54], [0, 1], clamp);
  const wave = interpolate(frame, [A + 70, A + 92], [0, 1], { ...clamp, easing: easeOut });
  const crownCy = IMPLANT.crown.top + IMPLANT.crown.height / 2;

  return (
    <SceneExit from={DS.solution.duration - 8} to={DS.solution.duration}>
      <AbsoluteFill>
        <Center y={690} style={{ ...t.head, fontSize: 72, opacity: 1 - move }}>
          <Mask delay={0} exitAt={52}>
            А ТЕПЕРЬ — РЕШЕНИЕ
          </Mask>
        </Center>
        <Slab text="ИМПЛАНТАЦИЯ" y={slabY} size={size} delay={14} scale={slabScale} />

        <Center y={640} style={{ ...t.head, fontSize: 46, lineHeight: 1.2, fontWeight: 400, color: D.dim }}>
          <Mask delay={A - 4}>НОВЫЙ КОРЕНЬ ВМЕСТО</Mask>
          <Mask delay={A + 2}>УТРАЧЕННОГО ЗУБА</Mask>
        </Center>

        <div style={{ opacity: prog(frame, A, 10) }}>
          <Brackets x={300} y={820} w={480} h={680} opacity={0.55} />
        </div>
        <Implant
          parts={{
            gum: { opacity: gum, scaleX: 0.6 + 0.4 * gum },
            screw: { opacity: screw, scale: 0.3 + 0.7 * screw, originY: MORPH_Y },
            abutment: { opacity: abut, dy: -80 * (1 - abut) },
            crown: { opacity: crownOpacity, dy: -260 * (1 - crown) },
          }}
        />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <circle
            cx={IMPLANT.cx}
            cy={crownCy}
            r={150 * (0.8 + 0.8 * wave)}
            fill="none"
            stroke={D.lime}
            strokeWidth={2.5}
            opacity={frame >= A + 70 ? 0.8 * (1 - wave) : 0}
          />
        </svg>

        <Callout n={1} text="ВИНТ — КОРЕНЬ" y={1330} fromX={570} delay={A + 30} />
        <Callout n={2} text="АБАТМЕНТ" y={1130} fromX={600} delay={A + 50} />
        <Callout n={3} text="КОРОНКА" y={980} fromX={660} delay={A + 70} />
      </AbsoluteFill>
    </SceneExit>
  );
};
