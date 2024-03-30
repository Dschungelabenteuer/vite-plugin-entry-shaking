import EventEmitter from 'events';
import type { DebuggerEvents } from './types';

/** List of accepted debugger events. */
const events: (keyof DebuggerEvents)[] = [
  'increaseProcessTime',
  'increaseTransformTime',
  'incrementJsRequests',
  'incrementOtherRequests',
  'increaseEntryHits',
  'registerTransform',
  'registerLog',
];

/** Plugin's event bus used to communicate with the debugger. */
export class EventBus {
  /** Event emitter. */
  private emitter = new EventEmitter();

  /**
   * Executes subscribed callback when a registered event is emitted by the debugger.
   * @param eventName Received event name.
   * @param callback Callback to execute when the event is emitted
   */
  public on = <T extends keyof DebuggerEvents>(
    eventName: T,
    callback: (...args: DebuggerEvents[T]) => void,
  ) => this.emitter.on(eventName, callback as any);

  /**
   * Sends an event to the debugger.
   * @param eventName Event name to send.
   * @param args Arguments to send along with the event.
   */
  public emit = <T extends keyof DebuggerEvents>(event: T, ...args: DebuggerEvents[T]) =>
    this.emitter.emit(event, ...args);

  /**
   * Subscribe to events that may be emitted by the debugger.
   * @param cb Callback to execute when the relevant event is emitted.
   */
  public subscribe(cb: (event: keyof DebuggerEvents, data: any) => void) {
    events.forEach((event) => {
      this.on(event, (...args) => cb(event, args));
    });
  }
}
