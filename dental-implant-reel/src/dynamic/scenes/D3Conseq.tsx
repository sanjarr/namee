import { AbsoluteFill, Sequence, random, useCurrentFrame } from 'remotion';
import { SceneExit } from '../../components/SceneExit';
import { D, DS, easeInOut } from '../theme';
import { Brackets, Center, Mask, Typed, prog, t, type Seg } from '../ui';
import { mono } from '../../fonts';

const PANEL = { x: 90, y: 470, w: 900, h: 520 };
const PART = 110;

// Силуэт моляра в рамке 100 × 150: коронка с двумя буграми и два корня
const TOOTH_PATH =
  'M12 10 C22 0 38 2 50 10 C62 2 78 0 88 10 C100 22 100 48 92 66 C88 76 86 90 84 110 ' +
  'C82 132 76 148 68 148 C60 148 58 126 56 108 C55 98 53 92 50 92 C47 92 45 98 44 108 ' +
  'C42 126 40 148 32 148 C24 148 18 132 16 110 C14 90 12 76 8 66 C0 48 0 22 12 10 Z';

const Tooth: React.FC<{
  cx: number;
  cy: number;
  rot?: number;
  scale?: number;
  flip?: boolean;
  fill?: string;
  opacity?: number;
  dashed?: boolean;
}> = ({ cx, cy, rot = 0, scale = 1, flip = false, fill = '#FFFFFF', opacity = 0.94, dashed = false }) => (
  <path
    d={TOOTH_PATH}
    transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${scale} ${flip ? -scale : scale}) translate(-50 -75)`}
    fill={dashed ? 'none' : fill}
    stroke={dashed ? D.lime : undefined}
    strokeWidth={dashed ? 3 / scale : undefined}
    strokeDasharray={dashed ? `${10 / scale} ${10 / scale}` : undefined}
    opacity={opacity}
  />
);

// 01 — соседние зубы наклоняются и сдвигаются в пустоту
const VizShift: React.FC = () => {
  const frame = useCurrentFrame();
  const p = prog(frame, 22, 60, easeInOut);
  const cy = 280;
  return (
    <>
      <Tooth cx={110 + 20 * p} cy={cy} />
      <Tooth cx={250 + 62 * p} cy={cy} rot={13 * p} />
      <Tooth cx={450} cy={cy} dashed scale={1 - 0.3 * p} opacity={0.9} />
      <Tooth cx={650 - 62 * p} cy={cy} rot={-13 * p} />
      <Tooth cx={790 - 20 * p} cy={cy} />
      <path d="M325 410 h60 m-14 -14 l14 14 l-14 14" stroke={D.lime} strokeWidth={4} fill="none" opacity={p} strokeLinecap="round" />
      <path d="M575 410 h-60 m14 -14 l-14 14 l14 14" stroke={D.lime} strokeWidth={4} fill="none" opacity={p} strokeLinecap="round" />
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
      {/* Корни уходят в кость: зубы рисуем под ней */}
      {[110, 250, 650, 790].map((x) => (
        <Tooth key={x} cx={x} cy={300} />
      ))}
      <path
        d={`M70 470 V330 H250 C330 330 360 ${330 + d} 450 ${330 + d} C540 ${330 + d} 570 330 650 330 H830 V470 Z`}
        fill="#E8EEF9"
        opacity={0.88}
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
      {/* Верхний ряд — корнями вверх, нижний — корнями вниз */}
      {xs.map((x) => (
        <Tooth key={`u${x}`} cx={x} cy={230} scale={0.8} flip />
      ))}
      <g transform={`translate(${34 * p} ${-6 * p}) rotate(${2.5 * p} 450 370)`}>
        {xs.map((x) => (
          <Tooth key={`l${x}`} cx={x} cy={360} scale={0.8} fill="#C9D6F2" opacity={0.96} />
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
