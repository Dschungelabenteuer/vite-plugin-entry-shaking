import type { Logger } from './logger';
import type { Duration, PerformanceDuration } from './types';

export class Timer {
  constructor(public logger: Logger) {}

  /**
   * Measures the duration of a logic execution.
   * @param title Title of the execution logic.
   * @param callback Function to trigger and measure.
   * @param silent Set to `true` if the execution duration should not be logged.
   */
  public async measure<
    Title extends string,
    Callback extends (...args: any[]) => any,
    Silent extends boolean,
    Return = Callback extends (...args: any[]) => infer R ? R : any,
  >(
    title: Title,
    callback: Callback,
    silent?: Silent,
  ): Promise<PerformanceDuration & { out?: Awaited<Return> }> {
    if (!silent) this.logger.debug(`${title} started`);
    const startTime = performance.now();
    const out = await callback();
    const time = performance.now() - startTime;
    if (!silent) this.logger.debug(`${title} ended, it took ${time.toFixed(2)}ms`);
    return { out, time, self: time };
  }

  /**
   * Measures both self and total duration of a logic execution and returns them
   * as a `Duration` tuple. This method wraps the `measure` method so that one
   * can fine-tune differences between self and total times.
   * @param title Title of the execution logic.
   * @param callback Function to trigger and measure.
   */
  public async time(
    label: string,
    callback: (nonSelfTime: number) => Promise<number>,
  ): Promise<Duration> {
    const nonselfTime = 0;
    const { time } = await this.measure(label, () => callback(nonselfTime), true);
    const self = time - nonselfTime;
    return [time, self];
  }
}
