import { IconBrandInstagram, IconSend } from '@tabler/icons-react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { IconPop } from '../../components/IconPop';
import { D, clamp, easeIn, easeOut } from '../theme';
import { Center, Mask, Slab, Typed, prog, t, useFit } from '../ui';
import { mono } from '../../fonts';

const BOX = { x: 100, y: 1190, w: 880, h: 130 };

export const D8Cta: React.FC<{ keyword: string; handle: string; clinicName: string }> = ({
  keyword,
  handle,
  clinicName,
}) => {
  const frame = useCurrentFrame();
  const zap = useFit('ЗАПИШЕМСЯ?', 840, 150);
  const form = 1 - prog(frame, 144, 12, easeIn);
  const formIn = prog(frame, 64, 16);
  const end = prog(frame, 152, 16);
  const pulse = 1 + 0.04 * Math.max(0, Math.sin(((frame - 110) / 18) * Math.PI)) * (frame > 110 ? 1 : 0);

  return (
    <AbsoluteFill>
      {/* Вопрос и поле ввода (до 150-го кадра) */}
      <div style={{ opacity: form }}>
        <Center y={760} style={{ ...t.head, fontSize: 110 }}>
          <Mask delay={0} exitAt={140}>
            НУ ЧТО,
          </Mask>
        </Center>
        <Slab text="ЗАПИШЕМСЯ?" y={940} size={zap} delay={10} rotate={-2} />

        <Center y={1100} style={{ ...t.head, fontSize: 44, fontWeight: 400, opacity: formIn }}>
          НАПИШИТЕ НАМ В DIRECT СЛОВО
        </Center>
        <div
          style={{
            position: 'absolute',
            left: BOX.x,
            top: BOX.y,
            width: BOX.w,
            height: BOX.h,
            borderRadius: 28,
            background: 'rgba(255,255,255,0.06)',
            border: `2px solid rgba(222,255,92,0.55)`,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            padding: '0 36px',
            opacity: formIn,
            transform: `translateY(${(1 - formIn) * 40}px) scale(${pulse})`,
            boxShadow: `0 0 40px ${D.glow}`,
          }}
        >
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 52, color: D.white, flex: 1, letterSpacing: '0.04em' }}>
            <Typed segs={[{ text: keyword }]} delay={84} cps={9} />
          </div>
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: '50%',
              background: D.lime,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 30px ${D.glow}`,
              transform: `scale(${1 + 0.1 * Math.max(0, Math.sin(((frame - 118) / 14) * Math.PI)) * (frame > 118 ? 1 : 0)})`,
            }}
          >
            <IconPop delay={70}>
              <IconSend size={40} stroke={1.8} color={D.ink} />
            </IconPop>
          </div>
        </div>
      </div>

      {/* Финальная карточка: белый логотип на Sapphire, слоган, ник */}
      <AbsoluteFill style={{ opacity: end }}>
        <Img
          src={staticFile('brand/logo-horizontal-white.png')}
          alt={clinicName}
          style={{
            position: 'absolute',
            left: 540 - 380,
            top: 780,
            width: 760,
            opacity: end,
            transform: `translateY(${(1 - end) * 24}px)`,
          }}
        />
        <Center y={1060} style={{ ...t.head, fontSize: 52, lineHeight: 1.2 }}>
          <Mask delay={166}>ИСКРЯЩИЕСЯ УЛЫБКИ —</Mask>
          <Mask delay={174}>В КАЖДОМ ЗУБЕ</Mask>
          <Mask delay={182} style={{ color: D.lime, textShadow: `0 0 36px ${D.glow}` }}>
            ПО КАРАТУ СЧАСТЬЯ
          </Mask>
        </Center>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1290,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 14,
            opacity: interpolate(frame, [196, 212], [0, 1], { ...clamp, easing: easeOut }),
          }}
        >
          <IconBrandInstagram size={44} stroke={1.6} color={D.white} />
          <span style={{ fontFamily: mono, fontSize: 38, color: D.white }}>{handle}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
