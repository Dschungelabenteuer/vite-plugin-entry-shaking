import type { HMRBroadcaster, ViteDevServer } from 'vite';
import type { Context } from 'vite-plugin-entry-shaking';
import type { ConsumerPackageInfo } from '../types';
import { wsMessageName, READY } from '../shared';
import { JSONMap } from '../serializer';

const _ = wsMessageName;

/**
 * Creates a communication channel between debugger's server and client.
 * @param server Vite Dev Server instance.
 * @param ctx Detached plugin context.
 * @param consumer Information about consumer's `package.json` file.
 */
export function createChannel(
  { hot, config }: ViteDevServer,
  ctx: Context,
  consumer: ConsumerPackageInfo,
) {
  subscribeToEventBus(hot, ctx);
  const { root } = config;

  hot.on(READY, () => {
    hot.send(
      READY,
      JSONMap.stringify({
        root,
        consumer,
        entries: ctx.entries,
        metrics: ctx.metrics,
        logs: ctx.logger.logs,
        options: {
          diagnostics: ctx.options.diagnostics,
          debug: ctx.options.debug,
        },
        diagnostics: {
          list: ctx.diagnostics.list,
          listPerPath: ctx.diagnostics.listPerPath,
        },
      }),
    );
  });
}

/**
 * Re-routes plugin's Event Bus events to client via web sockets.
 * - Such events are defined in the `packages/core/src/event-bus.ts` file.
 * - They're handled client-side in the `packages/debugger/src/client/composables/useHotModule.ts` file.
 * @param ws Vite's Web Socket server.
 * @param ctx Detached plugin context.
 */
function subscribeToEventBus(hot: HMRBroadcaster, ctx: Context) {
  ctx.eventBus?.subscribe((event, data) => {
    hot.send(_(event), JSONMap.stringify(data.length > 1 ? [...data] : data[0]));
  });
}
