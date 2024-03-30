import type { ViteDevServer } from 'vite';

import { entries } from '../../mocks/entries';
import { transforms } from '../../mocks/transforms';
import { logs } from '../../mocks/logs';
import { metrics } from '../../mocks/metrics';
import { createDiagnostics } from '../../mocks/diagnostics';

import { READY, wsMessageName } from '../shared';
import { JSONMap } from '../serializer';
import type { ConsumerPackageInfo } from '../types';
import { options } from '../../mocks/options';
import { root } from '../../mocks/utils';

const diagnostics = createDiagnostics(entries);

const _ = wsMessageName;

const consumer: ConsumerPackageInfo = {
  name: 'vpes-debugger-with-mocks',
  version: '0.0.0',
};

function devPlugin() {
  return {
    name: 'vpes-client-dev-plugin',
    configureServer({ ws }: ViteDevServer) {
      ws.on(READY, () => {
        ws.send(
          READY,
          JSONMap.stringify({ root, entries, logs, consumer, metrics, diagnostics, options }),
        );
        transforms.forEach((transform) => {
          ws.send(_('registerTransform'), JSONMap.stringify(transform));
        });
      });
    },
  };
}

export default devPlugin;
