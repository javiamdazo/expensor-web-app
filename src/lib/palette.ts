// Validated categorical palette (see dataviz skill). Fixed hue order — never cycled arbitrarily.
export const CATEGORICAL_LIGHT = [
  '#2a78d6', // blue
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
  '#e87ba4', // magenta
  '#eb6834', // orange
];

export const CATEGORICAL_DARK = [
  '#3987e5',
  '#199e70',
  '#c98500',
  '#008300',
  '#9085e9',
  '#e66767',
  '#d55181',
  '#d95926',
];

export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

export function categoricalColor(index: number, dark: boolean): string {
  const ramp = dark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
  return ramp[index % ramp.length];
}
