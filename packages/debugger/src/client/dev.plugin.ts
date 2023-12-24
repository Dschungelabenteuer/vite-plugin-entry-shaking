import type { ViteDevServer } from 'vite';

import { entries } from '../../mocks/entries';
import { transforms } from '../../mocks/transforms';
import { logs } from '../../mocks/logs';

import { wsMessageName } from '../shared';
import { JSONMap } from '../serializer';
import type { ConsumerPackageInfo } from '../types';

const _ = wsMessageName;

const consumer: ConsumerPackageInfo = {
  name: 'vpes-debugger-with-mocks',
  version: '0.0.0',
};

function devPlugin() {
  return {
    name: 'vpes-client-dev-plugin',
    configureServer({ ws }: ViteDevServer) {
      ws.on(_('getAll'), () => {
        ws.send(_('getAll'), JSONMap.stringify({ entries, transforms, logs, consumer }));
      });
    },
  };
}

export default devPlugin;
