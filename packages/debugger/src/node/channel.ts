import type { ViteDevServer } from 'vite';
import type { Context } from 'vite-plugin-entry-shaking';
import { wsMessageName } from '../shared';
import { JSONMap } from '../serializer';
import type { ConsumerPackageInfo } from '../types';

const _ = wsMessageName;

export function createChannel(
  { ws }: ViteDevServer,
  context: Context,
  consumer: ConsumerPackageInfo,
) {
  ws.on(_('getAll'), () => {
    ws.send(
      _('getAll'),
      JSONMap.stringify({
        entries: context.entries,
        transforms: context.transforms,
        logs: context.logger.logs,
        consumer,
      }),
    );
  });
}
