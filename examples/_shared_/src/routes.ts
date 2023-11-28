import Home from './pages/Home.vue';
import Targets from './pages/Targets.vue';
import Logs from './pages/Logs.vue';

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
    name: 'Targets',
    path: '/targets',
    component: Targets,
    props: {
      icon: 'target-arrow',
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
