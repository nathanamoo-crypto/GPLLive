export const Colors = {
  // Backgrounds
  black:     '#0A0A0A',
  surface:   '#111111',
  surface2:  '#1A1A1A',
  border:    '#2A2A2A',

  // Brand accents
  yellow:    '#F5C518',
  yellowDim: '#BF9A10',
  red:       '#D0021B',
  green:     '#22C55E',

  // Text
  white:     '#FFFFFF',
  grey1:     '#9CA3AF',
  grey2:     '#4B5563',

  // Semantic aliases
  primary:      '#F5C518',
  background:   '#0A0A0A',
  card:         '#111111',
  text:         '#FFFFFF',
  textMuted:    '#9CA3AF',
  textDisabled: '#4B5563',
  danger:       '#D0021B',
  success:      '#22C55E',
  inputBg:      '#1A1A1A',
  borderColor:  '#2A2A2A',

  // Backward-compat aliases
  primaryLight: '#1A1A1A',
  accent:       '#F5C518',
  surfaceAlt:   '#1A1A1A',
  textPrimary:  '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#4B5563',
  textInverse:  '#0A0A0A',
  live:         '#D0021B',
  win:          '#22C55E',
  draw:         '#F5C518',
  loss:         '#D0021B',
  fantasyGold:  '#F5C518',
  pitchGrass:   '#22C55E',
  bench:        '#4B5563',
  borderLight:  '#2A2A2A',
  roleGk:       '#22C55E',
  roleDef:      '#3B82F6',
  roleMid:      '#A855F7',
  roleFwd:      '#F97316',

  // Tag objects (preserved)
  tagFE: { bg: '#1A2E14', text: '#7CC56C' },
  tagBE: { bg: '#2E1A14', text: '#E07A6A' },
  tagDB: { bg: '#142A3E', text: '#6AAAE0' },
  tag3P: { bg: '#1E1A3E', text: '#A07AD0' },
  tagAdmin: { bg: '#3E2A14', text: '#E0A060' },
};

// Light-mode counterpart, mirroring every key above. Brand accents (yellow,
// red, blue, purple, orange) stay constant across themes; backgrounds, text,
// and greys invert for contrast on a white surface.
export const LightColors: typeof Colors = {
  // Backgrounds
  black:     '#FFFFFF',
  surface:   '#F5F5F5',
  surface2:  '#EDEDED',
  border:    '#E0E0E0',

  // Brand accents
  yellow:    '#F5C518',
  yellowDim: '#BF9A10',
  red:       '#D0021B',
  green:     '#16A34A',

  // Text
  white:     '#0A0A0A',
  grey1:     '#4B5563',
  grey2:     '#9CA3AF',

  // Semantic aliases
  primary:      '#F5C518',
  background:   '#FFFFFF',
  card:         '#F5F5F5',
  text:         '#0A0A0A',
  textMuted:    '#4B5563',
  textDisabled: '#9CA3AF',
  danger:       '#D0021B',
  success:      '#16A34A',
  inputBg:      '#EDEDED',
  borderColor:  '#E0E0E0',

  // Backward-compat aliases
  primaryLight: '#EDEDED',
  accent:       '#F5C518',
  surfaceAlt:   '#EDEDED',
  textPrimary:  '#0A0A0A',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  textInverse:  '#FFFFFF',
  live:         '#D0021B',
  win:          '#16A34A',
  draw:         '#F5C518',
  loss:         '#D0021B',
  fantasyGold:  '#F5C518',
  pitchGrass:   '#16A34A',
  bench:        '#9CA3AF',
  borderLight:  '#E0E0E0',
  roleGk:       '#16A34A',
  roleDef:      '#3B82F6',
  roleMid:      '#A855F7',
  roleFwd:      '#F97316',

  // Tag objects
  tagFE: { bg: '#E8F5E0', text: '#3A7D2C' },
  tagBE: { bg: '#F5E0D8', text: '#B5442E' },
  tagDB: { bg: '#DCEAF7', text: '#2C6FA8' },
  tag3P: { bg: '#E5DFF7', text: '#5C3D9E' },
  tagAdmin: { bg: '#F7E8D0', text: '#A8672C' },
};

export const Themes = {
  dark: Colors,
  light: LightColors,
} as const;

export type ThemeName = keyof typeof Themes;
