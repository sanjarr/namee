import { IconHourglass } from '@tabler/icons-react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { SceneExit } from '../../components/SceneExit';
import { IconPop } from '../../components/IconPop';
import { D, DS, clamp, easeOut } from '../theme';
import { Center, Hl, Mask, prog, t, useFit } from '../ui';

const BAR = { x: 160, y: 1130, w: 760, h: 56 };

export const D4Stat: React.FC = () => {
  const frame = useCurrentFrame();
  const size = useFit('25%', 820, 440);
  const count = interpolate(frame, [8, 52], [0, 25], { ...clamp, easing: easeOut });
  const pop = interpolate(frame, [8, 52], [0.9, 1], { ...clamp, easing: easeOut });
  const glitch = frame >= 52 && frame < 58 ? (random(`g-${frame}`) - 0.5) * 14 : 0;
  const lost = prog(frame, 64, 30);
  const barIn = prog(frame, 56, 14);

  return (
    <SceneExit from={DS.stat.duration - 8} to={DS.stat.duration}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', left: 540 - 36, top: 470 - 36, width: 72, height: 72 }}>
          <IconPop delay={0}>
            <IconHourglass size={72} stroke={1.5} color={D.lime} />
          </IconPop>
        </div>
        <Center y={570} style={{ ...t.head, fontSize: 64, color: D.dim }}>
          <Mask delay={4}>ДО</Mask>
        </Center>

        <Center
          y={850}
          style={{
            ...t.head,
            fontSize: size,
            color: D.lime,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            textShadow: `0 0 70px ${D.glow}`,
            transform: `translate(${glitch}px, -50%) scale(${pop})`,
          }}
        >
          {Math.round(count)}%
        </Center>
        <Center y={1030} style={{ ...t.mono, fontSize: 24, color: D.lime, opacity: prog(frame, 40, 10) }}>
          ПОТЕРЯ КОСТИ: {Math.round(count)} % · 1 ГОД
        </Center>

        {/* Шкала: объём кости, правая четверть «сгорает» */}
        <div style={{ position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, opacity: barIn }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `2px solid ${D.faint}` }} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${100 - 25 * lost}%`,
              borderRadius: 14,
              background: '#E8EEF9',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: '100%',
              width: '25%',
              borderRadius: '0 14px 14px 0',
              border: `2px dashed ${D.lime}`,
              boxSizing: 'border-box',
              opacity: lost,
              background: 'repeating-linear-gradient(135deg, rgba(222,255,92,0.28) 0 8px, transparent 8px 16px)',
            }}
          />
        </div>
        <div style={{ ...t.mono, position: 'absolute', left: BAR.x, top: BAR.y + 72, fontSize: 20, opacity: barIn }}>
          ЗДОРОВАЯ КОСТЬ
        </div>
        <div style={{ ...t.mono, position: 'absolute', right: 1080 - BAR.x - BAR.w, top: BAR.y + 72, fontSize: 20, color: D.lime, opacity: lost }}>
          ПОТЕРЯ
        </div>

        <Center y={1330} style={{ ...t.head, fontSize: 54, lineHeight: 1.2 }}>
          <Mask delay={72}>ОБЪЁМА КОСТИ МОЖЕТ УЙТИ</Mask>
          <div style={{ marginTop: 8 }}>
            <Hl delay={92}>В ПЕРВЫЙ ГОД</Hl>
          </div>
        </Center>
        <Center y={1480} style={{ ...t.mono, fontSize: 21, opacity: prog(frame, 110, 12) }}>
          * ЗНАЧЕНИЕ УТОЧНИТЕ У ВРАЧА
        </Center>
      </AbsoluteFill>
    </SceneExit>
  );
};
