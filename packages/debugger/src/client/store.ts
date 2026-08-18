import { reactive } from 'vue';

import type { Diagnostic } from 'vite-plugin-entry-shaking';
import type { ChannelStore } from '../types';

const diagnostics = {
  list: [] as Diagnostic[],
  listPerPath: new Map<string, number[]>(),
} satisfies ChannelStore['diagnostics'];

export const store = reactive<ChannelStore>({
  root: '/',
  name: 'debugger',
  version: undefined,
  rootDir: '',
  logs: [],
  diagnostics,
  metrics: { analysis: 0, jsRequests: 0, otherRequests: 0, process: 0, transform: 0 },
  entries: new Map(),
  transforms: new Map(),
  status: 'disconnected',
  consumer: { name: 'Debugger' },
  options: {} as ChannelStore['options'],
});
