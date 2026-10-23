import { measureText } from '@remotion/layout-utils';
import type { ActiveFamily } from './fonts';

// Измерения текста, которые нужны до рендера: границы слова «мелочь.»
// для проводника (сцена 2) и ужатые кегли заголовков, чтобы широкий
// Erbaum не вылезал за безопасную зону x 80…1000.
export type Layout = {
  family: ActiveFamily;
  W: { left: number; right: number };
  sizes: {
    s1Line1: number;
    s1Line2: number;
    s2: number;
    s5Title: number;
    s7: number;
  };
};

const measure = (
  family: string,
  text: string,
  fontSize: number,
  fontWeight: number,
  letterSpacing?: string,
) =>
  measureText({
    text,
    fontFamily: family,
    fontSize,
    fontWeight,
    letterSpacing,
    validateFontIsLoaded: false,
  }).width;

const fit = (width: number, size: number, maxWidth: number) =>
  width > maxWidth ? Math.floor((size * maxWidth) / width) : size;

export const computeLayout = (family: ActiveFamily): Layout => {
  const H1 = 120;
  const H2 = 88;

  const s1Line1 = fit(measure(family, 'Нет одного', H1, 300, '-0.01em'), H1, 900);
  const s1Line2 = fit(measure(family, 'зуба?', H1, 500, '-0.01em'), H1, 900);
  const s5Title = fit(measure(family, 'Имплантация', H1, 300, '-0.01em'), H1, 900);
  const s2 = fit(measure(family, 'это мелочь.', H2, 300), H2, 840);
  const s7 = Math.min(
    fit(measure(family, 'Верните улыбке', H2, 300), H2, 780),
    fit(measure(family, 'целостность', H2, 500), H2, 780),
  );

  // Строка «это мелочь.» центрирована по x = 540, поэтому правая граница
  // слова — правый край строки, а левая — правый край минус ширина слова.
  const total = measure(family, 'это мелочь.', s2, 300);
  const word = measure(family, 'мелочь.', s2, 300);
  const right = 540 + total / 2;
  const left = right - word;

  return { family, W: { left, right }, sizes: { s1Line1, s1Line2, s2, s5Title, s7 } };
};

export const fallbackLayout: Layout = {
  family: 'Manrope',
  W: { left: 470, right: 790 },
  sizes: { s1Line1: 120, s1Line2: 120, s2: 88, s5Title: 120, s7: 88 },
};
