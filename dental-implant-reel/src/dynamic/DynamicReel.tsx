import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';
import { DynamicBackground, Hud } from './Hud';
import { D1Hook } from './scenes/D1Hook';
import { D2Doubt } from './scenes/D2Doubt';
import { D3Conseq } from './scenes/D3Conseq';
import { D4Stat } from './scenes/D4Stat';
import { D5Solution } from './scenes/D5Solution';
import { D6Was } from './scenes/D6Was';
import { D7Benefits } from './scenes/D7Benefits';
import { D8Cta } from './scenes/D8Cta';
import { DSFX } from './sfx';
import { DS, D_DURATION, clamp } from './theme';

export type DynamicReelProps = {
  clinicName: string;
  handle: string;
  keyword: string;
  withMusic: boolean;
  withSfx: boolean;
};

export const dynamicDefaultProps: DynamicReelProps = {
  clinicName: '32 КАРАТА',
  handle: '@32karata.kg',
  keyword: 'ИМПЛАНТ',
  withMusic: true,
  withSfx: true,
};

// Музыка: короткий fade-in и затухание в конце
const musicVolume = (f: number) =>
  Math.min(interpolate(f, [0, 12], [0, 1], clamp), interpolate(f, [D_DURATION - 45, D_DURATION], [1, 0], clamp));

export const DynamicReel: React.FC<DynamicReelProps> = ({ clinicName, handle, keyword, withMusic, withSfx }) => (
  <AbsoluteFill>
    <DynamicBackground />

    <Sequence name="D1 Хук" from={DS.hook.from} durationInFrames={DS.hook.duration}>
      <D1Hook />
    </Sequence>
    <Sequence name="D2 Сомнение" from={DS.doubt.from} durationInFrames={DS.doubt.duration}>
      <D2Doubt />
    </Sequence>
    <Sequence name="D3 Последствия" from={DS.conseq.from} durationInFrames={DS.conseq.duration}>
      <D3Conseq />
    </Sequence>
    <Sequence name="D4 Цифра" from={DS.stat.from} durationInFrames={DS.stat.duration}>
      <D4Stat />
    </Sequence>
    <Sequence name="D5 Решение" from={DS.solution.from} durationInFrames={DS.solution.duration}>
      <D5Solution />
    </Sequence>
    <Sequence name="D6 Было/стало" from={DS.was.from} durationInFrames={DS.was.duration}>
      <D6Was />
    </Sequence>
    <Sequence name="D7 Преимущества" from={DS.benefits.from} durationInFrames={DS.benefits.duration}>
      <D7Benefits />
    </Sequence>
    <Sequence name="D8 Запись" from={DS.cta.from} durationInFrames={DS.cta.duration}>
      <D8Cta keyword={keyword} handle={handle} clinicName={clinicName} />
    </Sequence>

    <Sequence name="HUD" from={0} durationInFrames={D_DURATION}>
      <Hud handle={handle} />
    </Sequence>

    {withMusic ? <Audio src={staticFile('music.mp3')} volume={(f) => 0.8 * musicVolume(f)} /> : null}
    {withSfx
      ? DSFX.map(({ at, sfx, volume, rate }, i) => (
          <Sequence key={`${sfx}-${at}-${i}`} name={`sfx ${sfx}`} from={at} layout="none">
            <Audio src={staticFile(`sfx/${sfx}.mp3`)} volume={volume} playbackRate={rate ?? 1} />
          </Sequence>
        ))
      : null}
  </AbsoluteFill>
);
