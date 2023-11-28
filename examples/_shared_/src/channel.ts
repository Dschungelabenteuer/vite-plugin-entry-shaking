import { reactive } from 'vue';
import { JSONMap } from 'vite-plugin-entry-shaking/serializer';
import type { PluginEntries, Log } from 'vite-plugin-entry-shaking';

export interface ChannelStore {
  rootDir: string;
  name: string;
  requestCount: number;
  disabled: boolean;
  expectations: string[];
  logs: Log[];
  targets: PluginEntries;
}

export function createChannel(pkgName: string, expected?: string[]): ChannelStore {
  const expectations: string[] = expected ?? [];
  const name = pkgName.split('example-').pop()!;
  const store = reactive<ChannelStore>({
    rootDir: '',
    name,
    expectations,
    logs: [],
    targets: new Map(),
    requestCount: 0,
    disabled: false,
  });

  if (import.meta.hot) {
    import.meta.hot.send('example-debug:req');
    import.meta.hot.on('example-debug:res', ({ requestCount, rootDir }) => {
      store.requestCount = requestCount;
      store.rootDir = rootDir;
    });

    import.meta.hot.send('count:req');
    import.meta.hot.on('count:res', ({ requestCount }) => {
      store.requestCount = requestCount;
    });

    import.meta.hot.send('debug:req');
    import.meta.hot.on('debug:res', ({ logs, entries }) => {
      store.logs = logs;
      store.targets = JSONMap.parse(entries) as PluginEntries;
    });
  }

  return store;
}
