import type { RouteRecordRaw } from 'vue-router';
import { createRouter as createVueRouter, createWebHashHistory } from 'vue-router';

import { doTransition, setAllLazyTransitions } from '@composable/useViewTransition';
import Home from './pages/home/Home.vue';
import Logs from './pages/logs/Logs.vue';
import Entries from './pages/entries/Entries.vue';
import Transforms from './pages/transforms/Transforms.vue';

export const routes: RouteRecordRaw[] = [
  {
    name: 'Home',
    path: '/',
    component: Home,
    meta: { navItem: false },
  },
  {
    name: 'Entries',
    path: '/entries',
    component: Entries,
    meta: {
      navItem: true,
      icon: 'target-arrow',
      transition: 'browser',
    },
  },
  {
    name: 'Transforms',
    path: '/transforms',
    component: Transforms,
    meta: {
      navItem: true,
      icon: 'sparkles',
      transition: 'browser',
    },
  },
  {
    name: 'Logs',
    path: '/logs',
    component: Logs,
    meta: {
      navItem: true,
      icon: 'clipboard-text',
      transition: 'browser',
    },
  },
];

export function createRouter() {
  const router = createVueRouter({
    history: createWebHashHistory(),
    routes,
  });

  router.beforeResolve(async () => {
    setAllLazyTransitions(false);
    await doTransition(undefined, () => setAllLazyTransitions(true));
  });

  return router;
}
