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
import { clamp } from './theme';

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
  clinicName: 'НАЗВАНИЕ КЛИНИКИ',
  handle: '@clinic_handle',
  keyword: 'ИМПЛАНТ',
  withMusic: false,
  withSfx: false,
};

const SFX: { file: string; frames: number[] }[] = [
  { file: 'sfx/shimmer.mp3', frames: [56, 476] },
  { file: 'sfx/whoosh.mp3', frames: [64, 134, 276, 346, 566] },
  { file: 'sfx/sparkle.mp3', frames: [506, 600] },
];

const musicVolume = (f: number) =>
  Math.min(interpolate(f, [0, 15], [0, 0.8], clamp), interpolate(f, [690, 720], [0.8, 0], clamp));

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

    <Sequence name="S1Hook" from={0} durationInFrames={72}>
      <S1Hook layout={layout} />
    </Sequence>
    <Sequence name="S2Doubt" from={72} durationInFrames={72}>
      <S2Doubt layout={layout} />
    </Sequence>
    <Sequence name="S3Consequences" from={144} durationInFrames={144}>
      <S3Consequences />
    </Sequence>
    <Sequence name="S4Stat" from={288} durationInFrames={72}>
      <S4Stat />
    </Sequence>
    <Sequence name="S5Solution" from={360} durationInFrames={144}>
      <S5Solution layout={layout} />
    </Sequence>
    <Sequence name="S6Benefits" from={504} durationInFrames={72}>
      <S6Benefits />
    </Sequence>
    <Sequence name="S7CTA" from={576} durationInFrames={144}>
      <S7CTA layout={layout} clinicName={clinicName} handle={handle} keyword={keyword} />
    </Sequence>

    <Sequence name="Guide" from={0} durationInFrames={720}>
      <Guide W={layout.W} />
    </Sequence>

    {withMusic ? <Audio src={staticFile('music.mp3')} volume={musicVolume} /> : null}
    {withSfx
      ? SFX.flatMap(({ file, frames }) =>
          frames.map((f) => (
            <Sequence key={`${file}-${f}`} from={f} layout="none">
              <Audio src={staticFile(file)} />
            </Sequence>
          )),
        )
      : null}
  </AbsoluteFill>
);
