import { reactive } from 'vue';

import type { ChannelStore } from '../types';

export const store = reactive<ChannelStore>({
  name: 'debugger',
  version: undefined,
  rootDir: '',
  logs: [],
  entries: [],
  transforms: [],
  status: 'disconnected',
  consumer: { name: 'Debugger' },
});
