import type { Logger as ViteLogger, LogOptions } from 'vite';
import type { EventBus } from './event-bus';
import type { BaseLogger, Log, LogLevel } from './types';

const EOS = `\x1b[0m\x1b[29m`;
const COLORS = {
  cyan: `\x1b[36m`,
  gray: `\x1b[9m\x1b[90m`,
};

/** Adds color to log message. */
const paint = (color: keyof typeof COLORS, text: string) => `${COLORS[color]}${text}${EOS}`;

/** Prepends log message with the plugin name. */
const logPrefix = paint('cyan', `[vite:entry-shaking]`);

/** Dumb function to format log messages. */
const formatMessage = (msg: string) => `${logPrefix} ${msg}`;

/** Plugin's logger. */
export class Logger implements BaseLogger {
  /** List of all logs. */
  public logs: Log[] = [];

  /** Plugin's Event Bus. */
  public eventBus?: EventBus;

  constructor(
    /** Base Vite logger. */
    private baseLogger: ViteLogger,
    /** Is debug mode enabled? */
    private debugMode: boolean,
  ) {}

  /**
   * Logs a debug message.
   * @param content Log message content.
   * @param options Log options.
   */
  public debug = (content: string, options?: LogOptions) => {
    if (this.debugMode) this.baseLogger?.info?.(content, options);
    this.addLog(content, 'debug');
  };

  /**
   * Logs an information message.
   * @param content Information message.
   * @param options Log options.
   * @param faded Is the information of secondary importance?
   */
  public info = (content: string, options?: LogOptions, faded = false) => {
    const msg = formatMessage(faded ? paint('gray', content) : content);
    if (this.debugMode) this.baseLogger?.info?.(msg, options);
    this.addLog(content, 'info');
  };

  /**
   * Logs a warning message.
   * @param content Warning message.
   * @param options Log options.
   */
  public warn: ViteLogger['warn'] = (content, options) => {
    const msg = formatMessage(content);
    if (this.debugMode) this.baseLogger?.warn?.(msg, options);
    this.addLog(content, 'warn');
  };

  /**
   * Logs an error.
   * @param content Error message.
   * @param options Log options.
   */
  public error: ViteLogger['error'] = (content, options) => {
    const msg = formatMessage(content);
    if (this.debugMode) this.baseLogger?.error?.(msg, options);
    this.addLog(content, 'error');
  };

  /**
   * Logs a success message.
   * @param content Success message.
   * @param options Log options.
   */
  public success: ViteLogger['info'] = (content, options) => {
    const msg = formatMessage(content);
    if (this.debugMode) this.baseLogger?.info?.(msg, options);
    this.addLog(content, 'success');
  };

  /**
   * Attaches the event bus to the logger so that logs may be transmitted to debugger.
   * @param eventBus Event bus instance.
   */
  public getOntoEventBus(eventBus: EventBus) {
    // French train strikes, you better get onto event bus instead.
    this.eventBus = eventBus;
  }

  /**
   * Adds a log to the list and notifies debugger through the event bus.
   * @param content Log message content.
   * @param level Log level.
   */
  private addLog(content: string, level: LogLevel | 'success') {
    this.logs.push({ content, level, timestamp: Date.now() });
    this.eventBus?.emit('registerLog', { content, level, timestamp: Date.now() });
  }
}
