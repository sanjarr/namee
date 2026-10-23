import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';
import { Background } from './components/Background';
import { Guide } from './guide/Guide';
import { fallbackLayout, type Layout } from './layout';
import { S1Hook } from './scenes/S1Hook';
import { S2Doubt } from './scenes/S2Doubt';
import { S3Consequences } from './scenes/S3Consequences';
import { S4Stat } from './scenes/S4Stat';
import { S5Solution } from './scenes/S5Solution';
import { S6Benefits } from './scenes/S6Benefits';
import { S7CTA } from './scenes/S7CTA';
import { SFX_CUES } from './sfx';
import { DURATION, SCENES, clamp } from './theme';

export type DentalReelProps = {
  clinicName: string;
  handle: string;
  keyword: string;
  withMusic: boolean;
  withSfx: boolean;
  // Заполняется в calculateMetadata после загрузки шрифтов
  layout?: Layout;
};

export const defaultProps: DentalReelProps = {
  clinicName: '32 КАРАТА',
  handle: '@32karata.kg',
  keyword: 'ИМПЛАНТ',
  withMusic: false,
  withSfx: true,
};


const musicVolume = (f: number) =>
  Math.min(interpolate(f, [0, 15], [0, 0.8], clamp), interpolate(f, [DURATION - 30, DURATION], [0.8, 0], clamp));

export const DentalReel: React.FC<DentalReelProps> = ({
  clinicName,
  handle,
  keyword,
  withMusic,
  withSfx,
  layout = fallbackLayout,
}) => (
  <AbsoluteFill>
    <Background />

    <Sequence name="S1Hook" from={SCENES.s1.from} durationInFrames={SCENES.s1.duration}>
      <S1Hook layout={layout} />
    </Sequence>
    <Sequence name="S2Doubt" from={SCENES.s2.from} durationInFrames={SCENES.s2.duration}>
      <S2Doubt layout={layout} />
    </Sequence>
    <Sequence name="S3Consequences" from={SCENES.s3.from} durationInFrames={SCENES.s3.duration}>
      <S3Consequences />
    </Sequence>
    <Sequence name="S4Stat" from={SCENES.s4.from} durationInFrames={SCENES.s4.duration}>
      <S4Stat />
    </Sequence>
    <Sequence name="S5Solution" from={SCENES.s5.from} durationInFrames={SCENES.s5.duration}>
      <S5Solution layout={layout} />
    </Sequence>
    <Sequence name="S6Benefits" from={SCENES.s6.from} durationInFrames={SCENES.s6.duration}>
      <S6Benefits />
    </Sequence>
    <Sequence name="S7CTA" from={SCENES.s7.from} durationInFrames={SCENES.s7.duration}>
      <S7CTA layout={layout} clinicName={clinicName} handle={handle} keyword={keyword} />
    </Sequence>

    <Sequence name="Guide" from={0} durationInFrames={DURATION}>
      <Guide W={layout.W} />
    </Sequence>

    {withMusic ? <Audio src={staticFile('music.mp3')} volume={musicVolume} /> : null}
    {withSfx
      ? SFX_CUES.map(({ at, sfx, volume, rate }) => (
          <Sequence key={`${sfx}-${at}`} name={`sfx ${sfx}`} from={at} layout="none">
            <Audio src={staticFile(`sfx/${sfx}.mp3`)} volume={volume} playbackRate={rate ?? 1} />
          </Sequence>
        ))
      : null}
  </AbsoluteFill>
);
