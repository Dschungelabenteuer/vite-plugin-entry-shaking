import type { Logger } from 'vite';

const EOS = `\x1b[0m\x1b[29m`;
const COLORS = {
  cyan: `\x1b[36m`,
  gray: `\x1b[9m\x1b[90m`,
};

export const paint = (color: keyof typeof COLORS, text: string) => `${COLORS[color]}${text}${EOS}`;

export const logPrefix = paint('cyan', `[vite:entry-shaking]`);

export const configureLogger = (logger: Logger, debug: boolean) => ({
  ...logger,
  info(
    message: Parameters<Logger['info']>[0],
    options: Parameters<Logger['info']>[1],
  ) { if (debug) logger.info(`${logPrefix} ${message}`, options); },
}) as Logger;
