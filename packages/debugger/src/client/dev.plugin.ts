import type { ViteDevServer } from 'vite';

import { entries } from '../../mocks/entries.ts';
import { transforms } from '../../mocks/transforms.ts';
import { logs } from '../../mocks/logs.ts';
import { metrics } from '../../mocks/metrics.ts';
import { createDiagnostics } from '../../mocks/diagnostics.ts';

import { READY, wsMessageName } from '../shared.ts';
import { JSONMap } from '../serializer.ts';
import type { ConsumerPackageInfo } from '../types.ts';
import { options } from '../../mocks/options.ts';
import { root } from '../../mocks/utils.ts';

const diagnostics = createDiagnostics(entries);

const _ = wsMessageName;

const consumer: ConsumerPackageInfo = { name: 'vpes-debugger-with-mocks', version: '0.0.0' };

function devPlugin() {
  return {
    name: 'vpes-client-dev-plugin',

    configureServer({ ws, config }: ViteDevServer) {
      console.log(config);
      ws.on(READY, () => {
        ws.send(
          READY,
          JSONMap.stringify({ root, entries, logs, consumer, metrics, diagnostics, options })
        );
        transforms.forEach((transform) => {
          ws.send(_('registerTransform'), JSONMap.stringify(transform));
        });
      });
    },
  };
}

export default devPlugin;
