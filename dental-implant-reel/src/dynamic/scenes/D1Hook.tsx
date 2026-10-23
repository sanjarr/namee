import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SceneExit } from '../../components/SceneExit';
import { DS, clamp, easeOut } from '../theme';
import { Center, Mask, Slab, t, useFit } from '../ui';

export const D1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const spor = useFit('СПОРИМ?', 800, 200);
  const key = useFit('ЗУБ — НЕ МЕЛОЧЬ', 840, 130);
  const drop = interpolate(frame, [50, 66], [-90, 0], { ...clamp, easing: easeOut });

  return (
    <SceneExit from={DS.hook.duration - 8} to={DS.hook.duration}>
      <AbsoluteFill>
        <Slab text="СПОРИМ?" y={900} size={spor} delay={0} exitAt={44} />

        <Center y={700} style={{ ...t.head, fontSize: 104, transform: `translateY(calc(-50% + ${drop}px)) rotate(-3deg)` }}>
          <Mask delay={50}>ЧЕРЕЗ МИНУТУ</Mask>
        </Center>
        <Center y={820} style={{ ...t.head, fontSize: 104 }}>
          <Mask delay={64}>ВЫ ПОЙМЁТЕ,</Mask>
        </Center>
        <Slab text="ЗУБ — НЕ МЕЛОЧЬ" y={1010} size={key} delay={84} />
      </AbsoluteFill>
    </SceneExit>
  );
};
