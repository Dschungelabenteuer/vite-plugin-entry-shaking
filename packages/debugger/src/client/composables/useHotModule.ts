import type { ViteHotContext } from 'vite/types/hot';
import type { DebuggerEvents } from 'vite-plugin-entry-shaking/src/event-bus';
import { store } from '#store';
import { READY, VITE_DISCONNECTED, VITE_CONNECTING, wsMessageName } from '../../shared';
import { JSONMap } from '../../serializer';

const pathToClient = import.meta.resolve('../../@vite/client', import.meta.url);

type DebuggerEventHandlers = {
  [Key in keyof DebuggerEvents]: (...args: DebuggerEvents[Key]) => void;
};

let hot: ViteHotContext;

/** Uses the communication channel created between debugger's server and client. */
export async function useHotModule(): Promise<ViteHotContext> {
  if (hot) return hot;

  const { createHotContext } = await import(pathToClient);
  hot = createHotContext();

  watchServerStatus(hot);
  getInitialState(hot);
  getInEventBus(hot, {
    increaseProcessTime: (a) => {
      store.metrics.process += a;
    },
    registerTransform: (transform) => {
      store.transforms.push(transform);
    },
  });

  return hot;
}

/**
 * Returns the initial state of the plugin (based on plugin's context once the server is ready).
 * @param hotContext Vite's hot context.
 */
function getInitialState(hotContext: ViteHotContext) {
  hotContext.send(READY);
  hotContext.on(READY, (res) => {
    const data = JSONMap.parse(res);
    store.logs = data.logs ?? [];
    store.entries = data.entries;
    store.metrics = data.metrics;
    store.transforms = data.transforms ?? [];
    store.status = 'connected';
  });
}

/**
 * Gets in plugin's event bus and handles received events.
 * @param hotContext Vite's hot context.
 */
function getInEventBus(hotContext: ViteHotContext, handlers: DebuggerEventHandlers) {
  const events = Object.keys(handlers) as (keyof DebuggerEvents)[];
  events.forEach((event) => {
    hotContext.on(wsMessageName(event), (...args) => {
      handlers[event]?.(...(args as any));
    });
  });
}

/**
 * Watches Vite's server status and handles changes.
 * @param hotContext Vite's hot context.
 */
function watchServerStatus(hotContext: ViteHotContext) {
  hotContext.on(VITE_DISCONNECTED, () => {
    store.status = 'disconnected';
  });

  hotContext.on(VITE_CONNECTING, () => {
    store.status = 'connecting';
  });
}
