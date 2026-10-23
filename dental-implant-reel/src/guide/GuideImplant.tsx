import { colors } from '../theme';

// Мини-имплантат 32 × 72, точка привязки — центр
export const GuideImplant: React.FC<{
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  haloOpacity: number;
  haloScale: number;
}> = ({ x, y, rotate, scale, opacity, haloOpacity, haloScale }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 0,
      height: 0,
      transform: `scale(${scale})`,
    }}
  >
    {/* Ореол */}
    <div
      style={{
        position: 'absolute',
        left: -45,
        top: -45,
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.goldLight} 0%, ${colors.goldLight}00 70%)`,
        opacity: haloOpacity,
        transform: `scale(${haloScale})`,
      }}
    />
    <svg
      width={32}
      height={72}
      viewBox="0 0 32 72"
      style={{
        position: 'absolute',
        left: -16,
        top: -36,
        overflow: 'visible',
        opacity,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {/* Винт: высота 36, верх 14, низ 9 */}
      <path d="M9 34 L23 34 L20.5 70 L11.5 70 Z" fill={colors.titanium} />
      {[40, 48, 56, 64].map((yy) => (
        <line
          key={yy}
          x1={9.5}
          y1={yy + 2.5}
          x2={22.5}
          y2={yy - 2.5}
          stroke={colors.thread}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
      {/* Абатмент: 12 × 8 */}
      <path d="M11 26 L21 26 L22 34 L10 34 Z" fill={colors.abutment} />
      {/* Коронка: 32 × 24 */}
      <path
        d="M1.5 9 C1.5 3 5 1.5 9 2.5 C12 3.2 13.5 3.8 16 2.8 C18.5 3.8 20 3.2 23 2.5 C27 1.5 30.5 3 30.5 9 C30.5 16 28 21 24 26 L8 26 C4 21 1.5 16 1.5 9 Z"
        fill={colors.surface}
        stroke={colors.gold}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  </div>
);
