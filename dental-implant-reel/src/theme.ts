import { Easing } from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 720;

// 100 BPM → 1 бит = 18 кадров, 1 такт = 72 кадра
export const BPM = 100;
export const BEAT = 18;
export const BAR = 72;

// Палитра «32 КАРАТА» (брендбук): Sapphire #04254E, Indigo Crayola #5D80D8,
// Immature yellow #DEFF5C, White. Остальные — производные оттенки.
export const brand = {
  sapphire: '#04254E',
  indigo: '#5D80D8',
  yellow: '#DEFF5C',
  white: '#FFFFFF',
};

export const colors = {
  bg: '#F6F8FD',
  surface: brand.white,
  ink: brand.sapphire,
  muted: '#7A89A6',
  accent: brand.indigo, // основной акцент
  glow: '#C4D2F6', // ореол свечения
  accentDeep: '#4767C4', // ядро линии на светлом фоне
  yellow: brand.yellow, // точечный акцент: искры, ключевое слово в кнопке
  ice: '#DFE7FB',
  mist: '#E9EEFB', // второе мягкое пятно внизу
  line: '#E0E6F2',
  titanium: '#AEB8C6',
  thread: '#94A1B4',
  abutment: '#C6CEDA',
  gum: '#F3DCDA',
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const flyEase = Easing.bezier(0.45, 0, 0.2, 1); // полёт проводника
export const softSpring = { damping: 200 };
export const bounceSpring = { damping: 14, mass: 0.8, stiffness: 120 };

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;
