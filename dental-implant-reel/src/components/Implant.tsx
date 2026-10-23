import { colors } from '../theme';

// Большой имплантат сцены 5. Координаты абсолютные (кадр 1080 × 1920),
// центр по x = 540, по y 860…1470.
export const IMPLANT = {
  cx: 540,
  crown: { top: 860, height: 230, width: 230, neck: 120 },
  abutment: { top: 1090, height: 80, topW: 70, bottomW: 100 },
  screw: { top: 1170, height: 300, topW: 90, bottomW: 56 },
  gum: { cy: 1170, width: 520, height: 60 },
};

export type ImplantParts = {
  gum: { opacity: number; scaleX: number };
  screw: { opacity: number; scale: number; originY: number };
  abutment: { opacity: number; dy: number };
  crown: { opacity: number; dy: number };
};

const trapezoid = (cx: number, top: number, h: number, topW: number, bottomW: number) =>
  `M${cx - topW / 2} ${top} L${cx + topW / 2} ${top} L${cx + bottomW / 2} ${top + h} L${
    cx - bottomW / 2
  } ${top + h} Z`;

const scaleAbout = (ox: number, oy: number, sx: number, sy = sx) =>
  `translate(${ox} ${oy}) scale(${sx} ${sy}) translate(${-ox} ${-oy})`;

const crownPath = () => {
  const { top, width: w, height: h, neck } = IMPLANT.crown;
  const l = IMPLANT.cx - w / 2;
  const n = (w - neck) / 2;
  // Коронка моляра: скруглённые бугры сверху, сужение к шейке
  return [
    `M${l} ${top + 64}`,
    `C${l} ${top + 12} ${l + 36} ${top - 2} ${l + 68} ${top + 8}`,
    `C${l + 90} ${top + 15} ${l + 100} ${top + 18} ${l + w / 2} ${top + 10}`,
    `C${l + 130} ${top + 18} ${l + 140} ${top + 15} ${l + 162} ${top + 8}`,
    `C${l + 194} ${top - 2} ${l + w} ${top + 12} ${l + w} ${top + 64}`,
    `C${l + w} ${top + 128} ${l + w - 22} ${top + 178} ${l + w - n} ${top + h}`,
    `L${l + n} ${top + h}`,
    `C${l + 22} ${top + 178} ${l} ${top + 128} ${l} ${top + 64} Z`,
  ].join(' ');
};

export const Implant: React.FC<{ parts: ImplantParts }> = ({ parts }) => {
  const { cx, crown, abutment, screw, gum } = IMPLANT;
  const threads = Array.from({ length: 9 }, (_, i) => {
    const y = screw.top + 15 + i * 30;
    const w = screw.topW + ((screw.bottomW - screw.topW) * (y - screw.top)) / screw.height;
    return { y, w };
  });

  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="screw-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={colors.thread} />
          <stop offset="0.35" stopColor={colors.titanium} />
          <stop offset="0.6" stopColor="#D5DCE2" />
          <stop offset="1" stopColor={colors.thread} />
        </linearGradient>
        <linearGradient id="abut-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={colors.titanium} />
          <stop offset="0.5" stopColor={colors.abutment} />
          <stop offset="1" stopColor={colors.titanium} />
        </linearGradient>
        <linearGradient id="crown-grad" x1="0" x2="0.4" y1="0" y2="1">
          <stop offset="0" stopColor={colors.surface} />
          <stop offset="1" stopColor="#F2F4F6" />
        </linearGradient>
        <filter id="crown-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="20" stdDeviation="20" floodColor="#12263A" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Винт */}
      <g
        opacity={parts.screw.opacity}
        transform={scaleAbout(cx, parts.screw.originY, parts.screw.scale)}
      >
        <path
          d={trapezoid(cx, screw.top, screw.height, screw.topW, screw.bottomW)}
          fill="url(#screw-grad)"
          strokeLinejoin="round"
        />
        {threads.map(({ y, w }) => (
          <line
            key={y}
            x1={cx - w / 2 - 6}
            y1={y + 7}
            x2={cx + w / 2 + 6}
            y2={y - 7}
            stroke={colors.thread}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Линия десны */}
      <rect
        x={cx - gum.width / 2}
        y={gum.cy - gum.height / 2}
        width={gum.width}
        height={gum.height}
        rx={30}
        fill={colors.gum}
        opacity={0.7 * parts.gum.opacity}
        transform={scaleAbout(cx, gum.cy, parts.gum.scaleX, 1)}
      />

      {/* Абатмент */}
      <path
        d={trapezoid(cx, abutment.top, abutment.height, abutment.topW, abutment.bottomW)}
        fill="url(#abut-grad)"
        opacity={parts.abutment.opacity}
        transform={`translate(0 ${parts.abutment.dy})`}
      />

      {/* Коронка */}
      <g opacity={parts.crown.opacity} transform={`translate(0 ${parts.crown.dy})`}>
        <path
          d={crownPath()}
          fill="url(#crown-grad)"
          stroke={colors.line}
          strokeWidth={3}
          filter="url(#crown-shadow)"
        />
        {/* Блик */}
        <path
          d={`M${cx - 82} ${crown.top + 60} C${cx - 80} ${crown.top + 34} ${cx - 60} ${
            crown.top + 24
          } ${cx - 36} ${crown.top + 28}`}
          fill="none"
          stroke={colors.ice}
          strokeWidth={10}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
