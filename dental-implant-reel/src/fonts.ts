import { loadFont } from '@remotion/fonts';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { continueRender, delayRender, staticFile } from 'remotion';

const weights = [
  ['300', 'Erbaum-Light.otf'],
  ['400', 'Erbaum-Book.otf'],
  ['500', 'Erbaum-Medium.otf'],
  ['700', 'Erbaum-Bold.otf'],
] as const;

export const loadErbaum = () =>
  Promise.all(
    weights.map(([weight, file]) =>
      loadFont({ family: 'Erbaum', url: staticFile(`fonts/${file}`), weight }),
    ),
  );

export const font = `'Erbaum', 'Manrope', sans-serif`;

export type ActiveFamily = 'Erbaum' | 'Manrope';

const loadFallback = async (): Promise<ActiveFamily> => {
  const manrope = loadManrope('normal', {
    weights: ['300', '400', '500', '700'],
    subsets: ['cyrillic', 'latin'],
  });
  await manrope.waitUntilDone();
  return 'Manrope';
};

// @remotion/fonts отменяет рендер, если файла нет, поэтому сначала
// проверяем, что все начертания Erbaum лежат в public/fonts/.
const erbaumFilesExist = async () => {
  const checks = await Promise.all(
    weights.map(([, file]) =>
      fetch(staticFile(`fonts/${file}`), { method: 'HEAD' })
        .then((r) => r.ok)
        .catch(() => false),
    ),
  );
  return checks.every(Boolean);
};

const handle = delayRender('Loading fonts (Erbaum / Manrope)');

// Резолвится семейством, которым реально набран текст. Используется
// для measureText, чтобы мерить строки тем же шрифтом, что на экране.
export const fontsReady: Promise<ActiveFamily> = erbaumFilesExist()
  .then((ok) => {
    if (!ok) throw new Error('Erbaum files are missing');
    return loadErbaum();
  })
  .then((): ActiveFamily => 'Erbaum')
  .catch((err) => {
    console.warn(
      '[DentalImplantReel] Шрифт Erbaum не найден в public/fonts/ — используется фолбэк Manrope (Google Fonts). ' +
        'Положите Erbaum-Light/Book/Medium/Bold.otf в public/fonts/.',
      err,
    );
    return loadFallback();
  })
  .catch((err): ActiveFamily => {
    console.warn('[DentalImplantReel] Не удалось загрузить и Manrope.', err);
    return 'Manrope';
  })
  .finally(() => continueRender(handle));
