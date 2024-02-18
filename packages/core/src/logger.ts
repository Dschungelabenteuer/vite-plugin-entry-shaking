import type { Logger as ViteLogger, LogOptions } from 'vite';
import type { EventBus } from './event-bus';

const EOS = `\x1b[0m\x1b[29m`;
const COLORS = {
  cyan: `\x1b[36m`,
  gray: `\x1b[9m\x1b[90m`,
};

export const paint = (color: keyof typeof COLORS, text: string) => `${COLORS[color]}${text}${EOS}`;
export const logPrefix = paint('cyan', `[vite:entry-shaking]`);

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export interface Log {
  level: LogLevel;
  content: string;
  timestamp: number;
}

export type BaseLogger = Pick<ViteLogger, Exclude<LogLevel, 'debug' | 'success'>>;

export class Logger implements BaseLogger {
  public logs: Log[] = [];

  /** Plugin's Event Bus. */
  public eventBus?: EventBus;

  constructor(
    private baseLogger: ViteLogger,
    private debugMode: boolean,
  ) {}

  public debug = (content: string, options?: LogOptions) => {
    if (this.debugMode) this.baseLogger?.info?.(content, options);
    this.addLog(content, 'debug');
  };

  public info = (content: string, options?: LogOptions, faded = false) => {
    const msg = this.formatMessage(faded ? paint('gray', content) : content);
    if (this.debugMode) this.baseLogger?.info?.(msg, options);
    this.addLog(content, 'info');
  };

  public warn: ViteLogger['warn'] = (content, options) => {
    const msg = this.formatMessage(content);
    if (this.debugMode) this.baseLogger?.warn?.(msg, options);
    this.addLog(content, 'warn');
  };

  public error: ViteLogger['error'] = (content, options) => {
    const msg = this.formatMessage(content);
    if (this.debugMode) this.baseLogger?.error?.(msg, options);
    this.addLog(content, 'error');
  };

  public success: ViteLogger['info'] = (content, options) => {
    const msg = this.formatMessage(content);
    if (this.debugMode) this.baseLogger?.info?.(msg, options);
    this.addLog(content, 'success');
  };

  public getOnTheEventBus(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  private addLog(content: string, level: LogLevel | 'success') {
    this.logs.push({ content, level, timestamp: Date.now() });
    this.eventBus?.emit('registerLog', { content, level, timestamp: Date.now() });
  }

  private formatMessage(msg: string) {
    return `${logPrefix} ${msg}`;
  }
}
