# DentalImplantReel — моушен-ролик «Имплантация зуба»

Remotion + TypeScript, 1080 × 1920, 30 fps, 720 кадров (24 с). Собран по ТЗ v2.

```bash
npm install
npm run studio   # npx remotion studio
npm run render   # npx remotion render DentalImplantReel out/dental-implant-reel.mp4 --codec=h264 --crf=18
```

## Шрифт
Положите купленные файлы Erbaum в `public/fonts/`: `Erbaum-Light.otf`, `Erbaum-Book.otf`,
`Erbaum-Medium.otf`, `Erbaum-Bold.otf`. Если их нет, текст набирается Manrope (Google Fonts),
а в консоль выводится предупреждение. Кегли заголовков и границы слова «мелочь.» для
проводника измеряются в `calculateMetadata` уже после загрузки шрифта, поэтому смена шрифта
ничего не ломает.

## Музыка и звуки
`public/music.mp3` (prop `withMusic`), `public/sfx/shimmer.mp3`, `whoosh.mp3`, `sparkle.mp3`
(prop `withSfx`). Текст — `clinicName`, `handle`, `keyword` — в `defaultProps` (`src/DentalReel.tsx`).

## Устройство
- `src/guide/legs.ts` — таблица сегментов проводника G0–G20 (раздел 5.3 ТЗ).
- `src/guide/state.ts` — позиция, наклон, парение и видимость имплантата как чистые функции кадра.
- `src/guide/GlowPath.tsx` — трёхслойная линия (ореол / средний / ядро), режимы `fly` и `draw`.
- `src/scenes/S1…S7` — сцены, кадры внутри сцены локальные.

## Отличия от ТЗ
- **Орбита G16** — 1,5 оборота вместо одного: только так она заканчивается в нижней точке
  (540, 796), с которой начинается G17, и проводник не «телепортируется».
- Во время пульса кнопки контур G18 масштабируется вместе с кнопкой, чтобы совпадать с ней.
- Заголовки автоматически ужимаются, если широкий Erbaum не помещается в безопасную зону.
- Строка «это мелочь.» поднята на 0.1em, чтобы зачёркивание на y = 900 шло по центру строчных букв.

> Цифру «до 25% в первый год» перед публикацией согласуйте с врачом клиники.
