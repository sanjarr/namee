import { loadFont } from '@remotion/google-fonts/Ubuntu';
import { continueRender, delayRender } from 'remotion';

// Фирменный шрифт «32 КАРАТА» по брендбуку — Ubuntu (Google Fonts, кириллица есть)
const ubuntu = loadFont('normal', {
  weights: ['300', '400', '500', '700'],
  subsets: ['cyrillic', 'cyrillic-ext', 'latin'],
});

export const font = `${ubuntu.fontFamily}, sans-serif`;

export type ActiveFamily = string;

const handle = delayRender('Loading font Ubuntu');

// Резолвится семейством, которым набран текст; по нему measureText мерит строки
export const fontsReady: Promise<ActiveFamily> = ubuntu
  .waitUntilDone()
  .then(() => ubuntu.fontFamily)
  .catch((err) => {
    console.warn('[DentalImplantReel] Не удалось загрузить Ubuntu из Google Fonts.', err);
    return ubuntu.fontFamily;
  })
  .finally(() => continueRender(handle));
