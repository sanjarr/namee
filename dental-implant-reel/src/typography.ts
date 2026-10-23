import type { CSSProperties } from 'react';
import { font } from './fonts';
import { colors } from './theme';

export const type = {
  h1: {
    fontFamily: font,
    fontWeight: 500,
    fontSize: 120,
    lineHeight: 1.05,
    letterSpacing: '-0.01em',
    color: colors.ink,
  },
  h2: {
    fontFamily: font,
    fontWeight: 400,
    fontSize: 88,
    lineHeight: 1.1,
    color: colors.ink,
  },
  stat: {
    fontFamily: font,
    fontWeight: 300,
    fontSize: 300,
    lineHeight: 1,
    color: colors.accent,
  },
  accent: {
    fontWeight: 700,
    color: colors.accent,
  },
  body: {
    fontFamily: font,
    fontWeight: 400,
    fontSize: 42,
    lineHeight: 1.35,
    color: colors.ink,
  },
  label: {
    fontFamily: font,
    fontWeight: 700,
    fontSize: 26,
    textTransform: 'uppercase',
    letterSpacing: '0.28em',
    color: colors.accent,
  },
  button: {
    fontFamily: font,
    fontWeight: 700,
    fontSize: 36,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
} satisfies Record<string, CSSProperties>;
