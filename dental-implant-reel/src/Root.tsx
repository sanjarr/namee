import { Composition } from 'remotion';
import { DentalReel, defaultProps, type DentalReelProps } from './DentalReel';
import { fontsReady } from './fonts';
import { computeLayout } from './layout';
import { DURATION, FPS, HEIGHT, WIDTH } from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DentalImplantReel"
    component={DentalReel}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={defaultProps}
    calculateMetadata={async ({ props }) => {
      // Мерим текст (границы «мелочь.» для проводника, кегли заголовков)
      // только после загрузки шрифта Ubuntu
      const family = await fontsReady;
      const layout = computeLayout(family);
      return { props: { ...props, layout } satisfies DentalReelProps };
    }}
  />
);
