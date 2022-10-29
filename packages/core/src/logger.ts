const EOS = `\x1b[0m\x1b[29m`;
const COLORS = {
  cyan: `\x1b[36m`,
  gray: `\x1b[9m\x1b[90m`,
}
export const paint = (color: keyof typeof COLORS, text: string) => `${COLORS[color]}${text}${EOS}`;