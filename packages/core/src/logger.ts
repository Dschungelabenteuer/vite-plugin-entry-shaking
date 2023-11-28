import type { Logger as ViteLogger, LogOptions } from 'vite';

const EOS = `\x1b[0m\x1b[29m`;
const COLORS = {
  cyan: `\x1b[36m`,
  gray: `\x1b[9m\x1b[90m`,
};

export const paint = (color: keyof typeof COLORS, text: string) => `${COLORS[color]}${text}${EOS}`;
export const logPrefix = paint('cyan', `[vite:entry-shaking]`);

export type LogLevel = 'info' | 'warn' | 'error';

export interface Log {
  level: LogLevel;
  content: string;
  faded?: boolean;
}

export type BaseLogger = Pick<ViteLogger, LogLevel>;

export class Logger implements BaseLogger {
  public logs: Log[] = [];

  constructor(
    private baseLogger: ViteLogger,
    private debug: boolean,
  ) {}

  public info = (content: string, options?: LogOptions, faded = false) => {
    const msg = this.formatMessage(faded ? paint('gray', content) : content);
    if (this.debug) this.baseLogger?.info?.(msg, options);
    this.logs.push({ content, level: 'info', faded });
  };

  public warn: ViteLogger['warn'] = (content, options) => {
    const msg = this.formatMessage(content);
    if (this.debug) this.baseLogger?.warn?.(msg, options);
    this.logs.push({ content, level: 'warn' });
  };

  public error: ViteLogger['error'] = (content, options) => {
    const msg = this.formatMessage(content);
    if (this.debug) this.baseLogger?.error?.(msg, options);
    this.logs.push({ content, level: 'error' });
  };

  private formatMessage(msg: string) {
    return `${logPrefix} ${msg}`;
  }
}
