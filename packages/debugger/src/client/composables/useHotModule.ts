import type { NormalizedHotChannel } from 'vite';
import type { DebuggerEvents } from 'vite-plugin-entry-shaking';
import { store } from '#store';
import { READY, VITE_DISCONNECTED, VITE_CONNECTING, wsMessageName } from '../../shared';
import { JSONMap } from '../../serializer';

const pathToClient = import.meta.resolve('../../@vite/client', import.meta.url);

type DebuggerEventHandlers = {
  [Key in keyof DebuggerEvents]: (...args: DebuggerEvents[Key]) => void;
};

let hot: NormalizedHotChannel | undefined;

/** Uses the communication channel created between debugger's server and client. */
export async function useHotModule(): Promise<NormalizedHotChannel> {
  if (hot) return hot;

  const { createHotContext } = await import(/* @vite-ignore */ pathToClient);
  hot = createHotContext();

  watchServerStatus(hot!);
  getInitialState(hot!);
  getOnEventBus(hot!, {
    increaseProcessTime: (a) => {
      store.metrics.process += a;
    },
    increaseTransformTime: (a) => {
      store.metrics.transform += a;
    },
    incrementJsRequests: () => {
      store.metrics.jsRequests += 1;
    },
    incrementOtherRequests: () => {
      store.metrics.otherRequests += 1;
    },
    increaseEntryHits: (a) => {
      const entry = store.entries.get(a);
      if (entry) entry.hits += 1;
    },
    registerTransform: (transform) => {
      store.transforms.set(transform.id, transform);
    },
    registerLog: (log) => {
      store.logs.push(log);
    },
  });

  return hot!;
}

/**
 * Returns the initial state of the plugin (based on plugin's context once the server is ready).
 * @param hotContext Vite's hot context.
 */
function getInitialState(hotContext: NormalizedHotChannel) {
  hotContext.send(READY);
  hotContext.on(READY, (res) => {
    const data = JSONMap.parse(res);
    store.root = data.root;
    store.logs = data.logs ?? [];
    store.entries = data.entries;
    store.metrics = data.metrics;
    store.diagnostics = data.diagnostics;
    store.options = data.options;
    store.transforms = data.transforms ?? new Map();
    store.status = 'connected';
  });
}

/**
 * Gets in plugin's event bus and handles received events.
 * @param hotContext Vite's hot context.
 */
function getOnEventBus(hotContext: NormalizedHotChannel, handlers: DebuggerEventHandlers) {
  const events = Object.keys(handlers) as (keyof DebuggerEvents)[];
  events.forEach((event) => {
    hotContext.on(wsMessageName(event), (payload) => {
      handlers[event](JSONMap.parse(payload) as never);
    });
  });
}

/**
 * Watches Vite's server status and handles changes.
 * @param hotContext Vite's hot context.
 */
function watchServerStatus(hotContext: NormalizedHotChannel) {
  hotContext.on(VITE_DISCONNECTED, () => {
    store.status = 'disconnected';
  });

  hotContext.on(VITE_CONNECTING, () => {
    store.status = 'connecting';
  });
}
