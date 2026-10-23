import { AbsoluteFill, Sequence, random, useCurrentFrame } from 'remotion';
import { SceneExit } from '../../components/SceneExit';
import { D, DS, easeInOut } from '../theme';
import { Brackets, Center, Mask, Typed, prog, t, type Seg } from '../ui';
import { mono } from '../../fonts';

const PANEL = { x: 90, y: 470, w: 900, h: 520 };
const PART = 110;

const TOOTH = { w: 100, h: 132, r: 38 };

const toothBox = (cx: number, cy: number, rot = 0, opacity = 0.92) => (
  <rect
    x={cx - TOOTH.w / 2}
    y={cy - TOOTH.h / 2}
    width={TOOTH.w}
    height={TOOTH.h}
    rx={TOOTH.r}
    fill="#FFFFFF"
    opacity={opacity}
    transform={`rotate(${rot} ${cx} ${cy})`}
  />
);

// 01 — соседние зубы наклоняются и сдвигаются в пустоту
const VizShift: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 22, 60, easeInOut);
  const cy = 280;
  return (
    <>
      {toothBox(110 + 20 * p, cy)}
      {toothBox(250 + 62 * p, cy, 13 * p)}
      <rect
        x={450 - 55 * (1 - 0.45 * p)}
        y={cy - 66}
        width={110 * (1 - 0.45 * p)}
        height={132}
        rx={36}
        fill="none"
        stroke={D.lime}
        strokeWidth={3}
        strokeDasharray="10 10"
      />
      {toothBox(650 - 62 * p, cy, -13 * p)}
      {toothBox(790 - 20 * p, cy)}
      <path d="M325 400 h60 m-14 -14 l14 14 l-14 14" stroke={D.lime} strokeWidth={4} fill="none" opacity={p} strokeLinecap="round" />
      <path d="M575 400 h-60 m14 -14 l-14 14 l14 14" stroke={D.lime} strokeWidth={4} fill="none" opacity={p} strokeLinecap="round" />
    </>
  );
};

// 02 — кость под пустотой «проседает»
const VizBone: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 22, 60, easeInOut);
  const d = 64 * p;
  return (
    <>
      {toothBox(110, 215, 0, 0.92)}
      {toothBox(250, 215, 0, 0.92)}
      {toothBox(650, 215, 0, 0.92)}
      {toothBox(790, 215, 0, 0.92)}
      <path
        d={`M70 450 V330 H250 C330 330 360 ${330 + d} 450 ${330 + d} C540 ${330 + d} 570 330 650 330 H830 V450 Z`}
        fill="#E8EEF9"
        opacity={0.9}
      />
      <line x1={70} x2={830} y1={330} y2={330} stroke={D.lime} strokeWidth={2.5} strokeDasharray="8 8" opacity={0.9} />
      <path d={`M450 336 V${330 + d - 6} m-10 -12 l10 12 l10 -12`} stroke={D.lime} strokeWidth={4} fill="none" strokeLinecap="round" opacity={p} />
    </>
  );
};

// 03 — верхний и нижний ряд перестают совпадать
const VizBite: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 22, 56, easeInOut);
  const xs = [120, 285, 450, 615, 780];
  const miss = Math.floor(frame / 6) % 2 === 0;
  return (
    <>
      {xs.map((x) => (
        <rect key={`u${x}`} x={x - 56} y={190} width={112} height={90} rx={26} fill="#FFFFFF" opacity={0.92} />
      ))}
      <g transform={`translate(${34 * p} ${-8 * p}) rotate(${2.5 * p} 450 380)`}>
        {xs.map((x) => (
          <rect key={`l${x}`} x={x - 56} y={312} width={112} height={90} rx={26} fill="#C9D6F2" opacity={0.95} />
        ))}
      </g>
      <g opacity={p} transform="translate(450 296)">
        <circle r={22} fill={D.lime} opacity={miss ? 1 : 0.6} />
        <path d="M0 -10 V3 M0 11 V12" stroke={D.ink} strokeWidth={4.5} strokeLinecap="round" />
      </g>
    </>
  );
};

const VIZ = [VizShift, VizBone, VizBite];
const CAPTION = ['СМЕЩЕНИЕ СОСЕДНИХ ЗУБОВ', 'ПОТЕРЯ ОБЪЁМА КОСТИ', 'НАРУШЕНИЕ ПРИКУСА'];
const ITEMS: Seg[][] = [
  [{ text: 'СОСЕДНИЕ ЗУБЫ ' }, { text: 'СМЕЩАЮТСЯ', hl: true }],
  [{ text: 'КОСТЬ ' }, { text: 'УБЫВАЕТ', hl: true }, { text: ' СО ВРЕМЕНЕМ' }],
  [{ text: 'СЛОМАН ' }, { text: 'ПРИКУС', hl: true }, { text: ' И НАГРУЗКА' }],
];

const Part: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const Viz = VIZ[i];
  const inP = prog(frame, 0, 10);
  const outP = prog(frame, PART - 8, 8);
  const jitter = frame < 6 ? (random(`jit-${i}-${frame}`) - 0.5) * 18 : 0;
  return (
    <>
      <svg
        width={PANEL.w}
        height={PANEL.h}
        style={{
          position: 'absolute',
          left: PANEL.x,
          top: PANEL.y,
          opacity: inP * (1 - outP),
          transform: `translateX(${jitter}px)`,
        }}
      >
        <Viz />
      </svg>
      <div
        style={{
          ...t.mono,
          position: 'absolute',
          left: PANEL.x + 28,
          top: PANEL.y + 22,
          fontSize: 22,
          color: D.lime,
          opacity: inP * (1 - outP),
        }}
      >
        ДИАГРАММА {i + 1}/3 · {CAPTION[i]}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 1085,
          width: 900,
          opacity: 1 - outP,
          transform: `translateY(${-outP * 30}px)`,
        }}
      >
        <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 44, color: D.lime, marginBottom: 14 }}>
          {String(i + 1).padStart(2, '0')}
        </div>
        <div style={{ ...t.head, fontSize: 62, lineHeight: 1.12, letterSpacing: '-0.005em' }}>
          <Typed segs={ITEMS[i]} delay={8} cps={22} />
        </div>
      </div>
    </>
  );
};

export const D3Conseq: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.min(2, Math.floor(frame / PART));
  const panelIn = prog(frame, 6, 16);
  return (
    <SceneExit from={DS.conseq.duration - 8} to={DS.conseq.duration}>
      <AbsoluteFill>
        <Center y={405} style={{ ...t.label, fontSize: 36 }}>
          <Mask delay={0}>НА САМОМ ДЕЛЕ:</Mask>
        </Center>

        <div
          style={{
            position: 'absolute',
            left: PANEL.x,
            top: PANEL.y,
            width: PANEL.w,
            height: PANEL.h,
            borderRadius: 20,
            background: D.panel,
            border: `1.5px solid rgba(222,255,92,0.35)`,
            opacity: panelIn,
            transform: `scaleY(${0.9 + 0.1 * panelIn})`,
          }}
        />
        <Brackets x={PANEL.x - 10} y={PANEL.y - 10} w={PANEL.w + 20} h={PANEL.h + 20} opacity={panelIn} />

        {[0, 1, 2].map((i) => (
          <Sequence key={i} from={i * PART} durationInFrames={PART} layout="none">
            <Part i={i} />
          </Sequence>
        ))}

        {/* Индикатор 1/3 · 2/3 · 3/3 */}
        <div style={{ position: 'absolute', left: PANEL.x + PANEL.w - 150, top: PANEL.y + 26, display: 'flex', gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 34,
                height: 8,
                borderRadius: 4,
                background: i === active ? D.lime : D.faint,
                boxShadow: i === active ? `0 0 10px ${D.glow}` : undefined,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </SceneExit>
  );
};
