import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneExit } from '../../components/SceneExit';
import { D, DS } from '../theme';
import { Center, Mask, Slab, Strike, prog, t, textWidth, useFit } from '../ui';

const SIZE = 104;
const ITEMS = [
  { text: 'ПОДОЖДУ', y: 700, enter: 12, strike: 32 },
  { text: 'НЕ БОЛИТ', y: 860, enter: 42, strike: 62 },
  { text: 'ЭТО МЕЛОЧЬ', y: 1020, enter: 72, strike: 92 },
];

// Три «отговорки» по очереди зачёркиваются жёлтой линией — как лишние варианты в референсе
export const D2Doubt: React.FC = () => {
  const frame = useCurrentFrame();
  const nope = useFit('НЕ ТАК', 700, 150);

  return (
    <SceneExit from={DS.doubt.duration - 8} to={DS.doubt.duration}>
      <AbsoluteFill>
        <Center y={520} style={{ ...t.label, fontSize: 36 }}>
          <Mask delay={0}>ЧТО МЫ ДУМАЕМ:</Mask>
        </Center>

        {ITEMS.map(({ text, y, enter, strike }) => {
          const w = textWidth(text, SIZE, 700, '-0.01em');
          const s = prog(frame, strike, 10);
          return (
            <div key={text}>
              <Center
                y={y}
                style={{
                  ...t.head,
                  fontSize: SIZE,
                  opacity: 1 - 0.68 * s,
                  transform: `translateY(-50%) scale(${1 - 0.03 * s})`,
                }}
              >
                <Mask delay={enter}>{text}</Mask>
              </Center>
              <Strike x0={540 - w / 2 - 18} x1={540 + w / 2 + 18} y={y + 6} delay={strike} />
            </div>
          );
        })}

        <Center y={1170} style={{ ...t.head, fontSize: 88 }}>
          <Mask delay={130}>НО ЭТО</Mask>
        </Center>
        <Slab text="НЕ ТАК" y={1350} size={nope} delay={142} rotate={-2} />
        <Center y={1505} style={{ ...t.mono, fontSize: 22, color: D.dim }}>
          <Mask delay={160}>// ПРОВЕРЯЕМ НА ПОСЛЕДСТВИЯХ</Mask>
        </Center>
      </AbsoluteFill>
    </SceneExit>
  );
};
