import EventEmitter from 'events';
import type { TransformData } from './types';
import type { Log } from './logger';

export type DebuggerEvents = {
  increaseProcessTime: [number];
  registerTransform: [TransformData];
  registerLog: [Log];
};

const events: (keyof DebuggerEvents)[] = [
  'increaseProcessTime',
  'registerTransform',
  'registerLog',
];

export class EventBus {
  private emitter = new EventEmitter();

  public on = <T extends keyof DebuggerEvents>(
    event: T,
    callback: (...args: DebuggerEvents[T]) => void,
  ) => this.emitter.on(event, callback as any);

  public emit = <T extends keyof DebuggerEvents>(event: T, ...args: DebuggerEvents[T]) =>
    this.emitter.emit(event, ...args);

  public subscribe(cb: (event: keyof DebuggerEvents, data: any) => void) {
    events.forEach((event) => {
      this.on(event, (...args) => cb(event, args));
    });
  }
}
