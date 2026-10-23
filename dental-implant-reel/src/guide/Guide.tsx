import { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { GlowFilters, GlowPath, glowLegVisible } from './GlowPath';
import { GuideImplant } from './GuideImplant';
import { buildLegs, type WordBounds } from './legs';
import { Sparks } from './Sparks';
import { guidePosition, guideVisual, hoverWeight, isPathLeg } from './state';

// Глобальный слой проводника поверх всех сцен (абсолютные кадры)
export const Guide: React.FC<{ W: WordBounds }> = ({ W }) => {
  const frame = useCurrentFrame();
  const legs = useMemo(() => buildLegs(W), [W]);

  const [x, y] = guidePosition(legs, frame);
  const [px] = guidePosition(legs, frame - 1);
  const rotate = Math.max(-18, Math.min(18, (x - px) * 0.6));
  const hover = hoverWeight(legs, frame) * 6 * Math.sin((2 * Math.PI * frame) / 36);
  const visual = guideVisual(legs, frame);
  const haloScale = 1 + 0.05 * Math.sin((2 * Math.PI * frame) / 36);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <GlowFilters />
        {legs.filter(isPathLeg).map((leg) =>
          glowLegVisible(leg, frame) ? <GlowPath key={leg.id} leg={leg} frame={frame} /> : null,
        )}
        <Sparks legs={legs} frame={frame} />
      </svg>
      {visual.scale > 0.001 ? (
        <GuideImplant
          x={x}
          y={y + hover}
          rotate={rotate}
          scale={visual.scale}
          opacity={visual.opacity}
          haloOpacity={visual.haloOpacity}
          haloScale={haloScale}
        />
      ) : null}
    </AbsoluteFill>
  );
};
