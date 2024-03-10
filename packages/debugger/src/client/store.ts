import { reactive } from 'vue';

import type { PluginMetrics } from 'vite-plugin-entry-shaking';
import type { ChannelStore } from '../types';

export const store = reactive<ChannelStore>({
  name: 'debugger',
  version: undefined,
  rootDir: '',
  logs: [],
  metrics: {} as PluginMetrics,
  entries: new Map(),
  transforms: new Map(),
  status: 'disconnected',
  consumer: { name: 'Debugger' },
  mounted: false,
});
