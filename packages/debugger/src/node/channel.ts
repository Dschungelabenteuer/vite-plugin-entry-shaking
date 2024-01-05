import type { ViteDevServer, WebSocketServer } from 'vite';
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
export function createChannel({ ws }: ViteDevServer, ctx: Context, consumer: ConsumerPackageInfo) {
  subscribeToEventBus(ws, ctx);

  ws.on(READY, () => {
    ws.send(
      READY,
      JSONMap.stringify({
        metrics: ctx.metrics,
        entries: ctx.entries,
        logs: ctx.logger.logs,
        consumer,
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
function subscribeToEventBus(ws: WebSocketServer, ctx: Context) {
  ctx.eventBus?.subscribe((event, data) => {
    ws.send(_(event), JSONMap.stringify(data.length > 1 ? [...data] : data[0]));
  });
}
