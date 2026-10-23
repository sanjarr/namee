import type { CSSProperties, ReactNode } from 'react';

// Блок на всю ширину кадра, центр которого по вертикали — y
export const CenterAt: React.FC<{ y: number; style?: CSSProperties; children: ReactNode }> = ({
  y,
  style,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 80,
      right: 80,
      top: y,
      transform: 'translateY(-50%)',
      textAlign: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);
