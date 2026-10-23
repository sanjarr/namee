import { IconBrandInstagram, IconSend } from '@tabler/icons-react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { ctaScale } from '../cta';
import { IconPop } from '../components/IconPop';
import { LineDraw } from '../components/LineDraw';
import { CenterAt } from '../components/Positioned';
import { RevealWord } from '../components/RevealWord';
import type { Layout } from '../layout';
import { clamp, colors, easeOut } from '../theme';
import { type } from '../typography';

const SCENE_START = 576;
const CARD = { x: 80, y: 520, w: 920, h: 880 };
const BTN = { x: 180, y: 1230, w: 720, h: 120 };
// Исходник логотипа 650 × 144 px, на экране — 520 px по ширине
const LOGO_W = 520;
const LOGO_RATIO = 144 / 650;

export const S7CTA: React.FC<{ layout: Layout; clinicName: string; handle: string; keyword: string }> = ({
  layout,
  clinicName,
  handle,
  keyword,
}) => {
  const frame = useCurrentFrame();
  const fade = (from: number, to: number) => interpolate(frame, [from, to], [0, 1], clamp);

  const card = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: easeOut });
  const fill = fade(44, 58);
  const content = fade(48, 60);
  const shine = interpolate(frame, [56, 76], [0, 1], { ...clamp, easing: easeOut });
  const scale = ctaScale(SCENE_START + frame);

  // Координаты внутри карточки
  const inCard = (y: number) => y - CARD.y;

  return (
    <AbsoluteFill>
      {/* Официальный горизонтальный логотип (брендбук, «Версии логотипа»).
          Над ним и вокруг — свободное поле, без сложной графики. */}
      <Img
        src={staticFile('brand/logo-horizontal.png')}
        alt={clinicName}
        style={{
          position: 'absolute',
          left: 540 - LOGO_W / 2,
          top: 300 - (LOGO_W * LOGO_RATIO) / 2,
          width: LOGO_W,
          opacity: fade(0, 16),
          transform: `translateY(${12 * (1 - fade(0, 16))}px)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 48,
          backgroundColor: colors.surface,
          boxShadow: '0 40px 80px rgba(18,38,58,0.10)',
          opacity: card,
          transform: `translateY(${300 * (1 - card)}px)`,
        }}
      >
        <CenterAt y={inCard(620)} style={{ left: 0, right: 0, opacity: fade(10, 26) }}>
          <span style={{ ...type.label, marginRight: '-0.28em' }}>Консультация</span>
        </CenterAt>

        <CenterAt y={inCard(810)} style={{ ...type.h2, fontSize: layout.sizes.s7, left: 40, right: 40 }}>
          <div>
            <RevealWord delay={14}>Верните</RevealWord> <RevealWord delay={20}>улыбке</RevealWord>
          </div>
          <div>
            <RevealWord delay={26} style={type.accent}>
              целостность
            </RevealWord>
          </div>
        </CenterAt>

        <LineDraw
          delay={34}
          width={120}
          height={2}
          color={colors.accent}
          style={{ position: 'absolute', left: CARD.w / 2 - 60, top: inCard(960) - 1 }}
        />

        <CenterAt y={inCard(1090)} style={{ ...type.body, color: colors.muted, left: 40, right: 40 }}>
          <RevealWord delay={38}>
            Напишите нам в Direct,
            <br />
            чтобы записаться
          </RevealWord>
        </CenterAt>

        {/* Кнопка-пилюля. Контур рисует проводник (G18), пульс синхронен с G20 */}
        <div
          style={{
            position: 'absolute',
            left: BTN.x - CARD.x,
            top: BTN.y - CARD.y,
            width: BTN.w,
            height: BTN.h,
            borderRadius: 60,
            overflow: 'hidden',
            transform: `scale(${scale})`,
          }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundColor: colors.ink, opacity: fill }} />
          {frame >= 56 && frame <= 76 ? (
            <div
              style={{
                position: 'absolute',
                top: -40,
                bottom: -40,
                width: 120,
                left: -200 + (BTN.w + 400) * shine,
                backgroundColor: '#FFFFFF',
                opacity: 0.35,
                transform: 'rotate(20deg)',
              }}
            />
          ) : null}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <IconPop delay={48}>
              <IconSend size={40} stroke={1.5} color="#FFFFFF" />
            </IconPop>
            <span style={{ ...type.button, color: '#FFFFFF', opacity: content, whiteSpace: 'nowrap' }}>
              НАПИСАТЬ <span style={{ color: colors.yellow }}>«{keyword}»</span>
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 1470,
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          opacity: fade(60, 76),
        }}
      >
        <IconBrandInstagram size={40} stroke={1.5} color={colors.ink} />
        <span style={{ ...type.body }}>{handle}</span>
      </div>
    </AbsoluteFill>
  );
};
