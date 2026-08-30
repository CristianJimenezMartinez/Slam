export type TimerPhase = 'idle' | 'normal' | 'warning' | 'alert' | 'grace' | 'overtime';
export type TimerMode = 'countup' | 'countdown';
export type AudioChimeType = 'start' | 'warn-2m' | 'warn-30s' | 'end' | 'overtime';

export interface TimerPreset {
  id: string;
  name: string;
  subtitle: string;
  targetSeconds: number;
  graceSeconds: number;
  icon: string;
}

export const DEFAULT_PRESETS: TimerPreset[] = [
  {
    id: 'official',
    name: '3 Min Oficial',
    subtitle: '10s cortesía + penalización',
    targetSeconds: 180,
    graceSeconds: 10,
    icon: '🎙️'
  },
  {
    id: 'cantera',
    name: '1 Min Cantera',
    subtitle: 'Ronda relámpago / micro libre',
    targetSeconds: 60,
    graceSeconds: 5,
    icon: '⚡'
  },
  {
    id: 'extended',
    name: '4 Min Especial',
    subtitle: 'Muestra / duelo poético',
    targetSeconds: 240,
    graceSeconds: 10,
    icon: '🎭'
  }
];
