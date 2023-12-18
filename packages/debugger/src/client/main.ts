import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import './styles/common.scss';
import App from './App.vue';
import { routes } from './routes';

import { useHotModule } from './composables/useHotModule';

useHotModule();

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.mount('#app');
