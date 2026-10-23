import { loadFont } from '@remotion/google-fonts/Ubuntu';
import { loadFont as loadMono } from '@remotion/google-fonts/UbuntuMono';
import { continueRender, delayRender } from 'remotion';

// Фирменный шрифт «32 КАРАТА» по брендбуку — Ubuntu (Google Fonts, кириллица есть).
// Ubuntu Mono — моноширинное начертание того же семейства, для HUD-микротекста.
const ubuntu = loadFont('normal', {
  weights: ['300', '400', '500', '700'],
  subsets: ['cyrillic', 'cyrillic-ext', 'latin'],
});
const ubuntuMono = loadMono('normal', {
  weights: ['400', '700'],
  subsets: ['cyrillic', 'cyrillic-ext', 'latin'],
});

export const family = ubuntu.fontFamily;
export const font = `${ubuntu.fontFamily}, sans-serif`;
export const mono = `${ubuntuMono.fontFamily}, monospace`;

export type ActiveFamily = string;

const handle = delayRender('Loading fonts Ubuntu + Ubuntu Mono');

// Резолвится семейством, которым набран текст; по нему measureText мерит строки
export const fontsReady: Promise<ActiveFamily> = Promise.all([
  ubuntu.waitUntilDone(),
  ubuntuMono.waitUntilDone(),
])
  .then(() => ubuntu.fontFamily)
  .catch((err) => {
    console.warn('[DentalImplantReel] Не удалось загрузить шрифты из Google Fonts.', err);
    return ubuntu.fontFamily;
  })
  .finally(() => continueRender(handle));
