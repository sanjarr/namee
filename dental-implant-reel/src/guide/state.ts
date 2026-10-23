import { getLength, getPointAtLength } from '@remotion/paths';
import { interpolate, spring } from 'remotion';
import { FPS, bounceSpring, clamp, easeInOut, easeOut, flyEase, softSpring } from '../theme';
import type { Leg, PathLeg, Pt } from './legs';

// Чистые функции: состояние проводника в любом кадре без памяти о прошлых кадрах.

const lengthCache = new Map<string, number>();
export const pathLength = (d: string) => {
  let l = lengthCache.get(d);
  if (l === undefined) {
    l = getLength(d);
    lengthCache.set(d, l);
  }
  return l;
};

export const isPathLeg = (leg: Leg): leg is PathLeg => leg.kind === 'fly' || leg.kind === 'draw';

export const legProgress = (leg: PathLeg, frame: number) =>
  interpolate(frame, [leg.start, leg.end], [0, 1], {
    ...clamp,
    easing: leg.kind === 'fly' ? flyEase : easeInOut,
  });

export const pointOnPath = (d: string, len: number): Pt => {
  const p = getPointAtLength(d, Math.max(0, Math.min(pathLength(d), len)));
  return p ? [p.x, p.y] : [0, 0];
};

const legEnd = (leg: Leg): Pt => (isPathLeg(leg) ? pointOnPath(leg.path, pathLength(leg.path)) : leg.at);

// Позиция центра имплантата (без парения)
export const guidePosition = (legs: Leg[], frame: number): Pt => {
  let last: Leg | null = null;
  for (const leg of legs) {
    if (frame >= leg.start) last = leg;
  }
  if (!last) {
    const first = legs[0];
    return isPathLeg(first) ? pointOnPath(first.path, 0) : first.at;
  }
  if (isPathLeg(last) && frame < last.end) {
    return pointOnPath(last.path, pathLength(last.path) * legProgress(last, frame));
  }
  return legEnd(last);
};

// Вес парения: 1 в паузе, плавно уходит в 0 за 8 кадров до/после полёта
export const hoverWeight = (legs: Leg[], frame: number) => {
  let dist = Infinity;
  for (const leg of legs) {
    if (!isPathLeg(leg)) continue;
    const d = frame < leg.start ? leg.start - frame : frame > leg.end ? frame - leg.end : 0;
    dist = Math.min(dist, d);
  }
  return interpolate(dist, [0, 8], [0, 1], { ...clamp, easing: easeInOut });
};

export type GuideVisual = { scale: number; opacity: number; haloOpacity: number };

export const guideVisual = (legs: Leg[], frame: number): GuideVisual => {
  const hidden = { scale: 0, opacity: 0, haloOpacity: 0 };
  let current: Leg | null = null;
  for (const leg of legs) {
    if ((leg.kind === 'appear' || leg.kind === 'morph' || leg.kind === 'vanish') && frame >= leg.start) {
      current = leg;
    }
  }
  if (!current) return hidden;

  if (current.kind === 'appear') {
    const s = spring({
      frame: frame - current.start,
      fps: FPS,
      config: current.spring === 'bounce' ? bounceSpring : softSpring,
    });
    const haloOpacity = current.flash
      ? interpolate(frame, [current.start, current.start + 3, current.end], [0, 1, 0.55], clamp)
      : 0.55 * Math.min(1, s);
    return { scale: s, opacity: Math.min(1, s * 1.5), haloOpacity };
  }
  if (frame >= current.end) return hidden;

  const t = interpolate(frame, [current.start, current.end], [0, 1], { ...clamp, easing: easeOut });
  if (current.kind === 'morph') {
    return { scale: 1 + (current.toScale - 1) * t, opacity: 1 - t, haloOpacity: 0.55 * (1 - t) };
  }
  return { scale: 1 - t, opacity: 1 - t, haloOpacity: 0.55 * (1 - t) };
};

export const isFlying = (legs: Leg[], frame: number) =>
  legs.some((l) => l.kind === 'fly' && frame >= l.start && frame < l.end);
