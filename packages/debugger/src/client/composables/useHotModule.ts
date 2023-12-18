import type { ViteHotContext } from 'vite/types/hot';
import { wsMessageName } from '../../shared';
import { JSONMap } from '../../serializer';
import { store } from '../store';

const _ = wsMessageName;
const pathToClient = import.meta.resolve('../../@vite/client', import.meta.url);
let hot: ViteHotContext;

export async function useHotModule(): Promise<ViteHotContext> {
  if (hot) return hot;

  const { createHotContext } = await import(pathToClient);
  hot = createHotContext();
  hot.send(_('getAll'));
  hot.on(_('getAll'), (res) => {
    const data = JSONMap.parse(res);
    store.logs = data.logs ?? [];
    store.entries = data.entries;
    store.transforms = data.transforms ?? [];
    store.status = 'connected';
  });

  hot.on('vite:ws:disconnect', () => {
    store.status = 'disconnected';
  });

  hot.on('vite:ws:connect', () => {
    store.status = 'connecting';
  });

  return hot;
}
