import { Easing } from 'remotion';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 720;

// 100 BPM → 1 бит = 18 кадров, 1 такт = 72 кадра
export const BPM = 100;
export const BEAT = 18;
export const BAR = 72;

export const colors = {
  bg: '#F8F7F4',
  surface: '#FFFFFF',
  ink: '#12263A',
  muted: '#8A97A3',
  gold: '#B89B72', // основной акцент
  goldLight: '#E9D6B2', // ореол свечения
  goldDeep: '#9C7F55', // ядро линии на светлом фоне
  ice: '#DCE9EE',
  champagne: '#EFE6D8',
  line: '#E3E7EA',
  titanium: '#AEB8C1',
  thread: '#97A3AE',
  abutment: '#C7CED4',
  gum: '#F1DCD6',
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
