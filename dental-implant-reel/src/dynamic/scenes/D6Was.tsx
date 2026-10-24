import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SceneExit } from '../../components/SceneExit';
import { D, DS } from '../theme';
import { Center, Hl, Mask, Strike, prog, t, textWidth, useFit } from '../ui';

const OLD = [
  { text: 'ПУСТОТА НА МЕСТЕ ЗУБА,', y: 690, strike: 52 },
  { text: 'СМЕЩЕНИЕ, ПОТЕРЯ КОСТИ', y: 775, strike: 64 },
];

// «БЫЛО» зачёркивается, «СТАЛО» вспыхивает — как в референсе
export const D6Was: React.FC = () => {
  const frame = useCurrentFrame();
  const last = useFit('УЛЫБАЕТЕСЬ.', 860, 124);
  return (
    <SceneExit from={DS.was.duration - 8} to={DS.was.duration}>
      <AbsoluteFill>
        <Center y={560} style={{ ...t.head, fontSize: 56 }}>
          <Mask delay={0}>БЫЛО:</Mask>
        </Center>
        {OLD.map(({ text, y, strike }, i) => {
          const w = textWidth(text, 54, 700, '-0.01em');
          const s = prog(frame, strike, 10);
          return (
            <div key={text}>
              <Center y={y} style={{ ...t.head, fontSize: 54, opacity: 1 - 0.7 * s, color: D.dim }}>
                <Mask delay={8 + i * 8}>{text}</Mask>
              </Center>
              <Strike x0={540 - w / 2 - 14} x1={540 + w / 2 + 14} y={y + 4} delay={strike} weight={0.8} />
            </div>
          );
        })}

        <Center y={930} style={{ ...t.head, fontSize: 56 }}>
          <Mask delay={72}>
            <Hl delay={78}>СТАЛО:</Hl>
          </Mask>
        </Center>
        <Center y={1090} style={{ ...t.head, fontSize: 118 }}>
          <Mask delay={88}>ПОСТАВИЛИ,</Mask>
        </Center>
        <Center y={1230} style={{ ...t.head, fontSize: 118 }}>
          <Mask delay={106}>ПОДОЖДАЛИ,</Mask>
        </Center>
        <Center y={1380} style={{ ...t.head, fontSize: last, color: D.lime, textShadow: `0 0 50px ${D.glow}` }}>
          <Mask delay={124}>УЛЫБАЕТЕСЬ.</Mask>
        </Center>
      </AbsoluteFill>
    </SceneExit>
  );
};
