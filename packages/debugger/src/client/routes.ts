import Home from './pages/Home.vue';
import Logs from './pages/Logs.vue';
import Entries from './pages/Entries.vue';
import Transforms from './pages/Transforms.vue';

export const routes = [
  {
    name: 'Home',
    path: '/',
    component: Home,
    props: {
      navItem: false,
    },
  },
  {
    name: 'Entries',
    path: '/entries',
    component: Entries,
    props: {
      icon: 'target-arrow',
      navItem: true,
    },
  },
  {
    name: 'Transforms',
    path: '/transforms',
    component: Transforms,
    props: {
      icon: 'sparkles',
      navItem: true,
    },
  },
  {
    name: 'Logs',
    path: '/logs',
    component: Logs,
    props: {
      icon: 'clipboard-text',
      navItem: true,
    },
  },
];
