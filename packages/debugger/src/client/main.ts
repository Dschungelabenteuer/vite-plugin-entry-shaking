import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import './styles/common.scss';
import App from './App.vue';
import { routes } from './routes';
import { useHotModule } from './composables/useHotModule';

useHotModule();

const app = createApp(App);
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

app.use(router);
app.mount('#app');
