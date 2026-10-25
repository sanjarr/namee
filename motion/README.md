# Kinetic typography — «Красная цена ей было 50 тысяч…»

9:16, 1080×1920, 60 fps, motion blur (48 sub-frame samples, 0.6-frame shutter), white background,
Gotham Pro Black / Bold / Medium, accent words in red.

- `scene.js` — the whole animation as a function of time (`drawScene(t)`) + motion-blur frame renderer.
- `render.js` — renders frames in headless Chromium (Playwright) and muxes them with `voice.wav` via ffmpeg.
- `out/kinetic_typography_60fps.mp4` — result.

Fonts are not committed (Gotham is a commercial typeface). Put `GothamPro-Black.otf`, `GothamPro-Bold.otf`,
`GothamPro-Medium.otf` into `fonts/`, then:

```
node render.js                       # full render
node render.js --preview 0.5,2.0,4.7 # stills into out/
```
