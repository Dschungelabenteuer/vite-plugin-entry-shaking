import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import './styles/common.scss';
import App from './App.vue';
import { routes } from './routes';
import { createChannel } from '.';

const store = createChannel('debug');
const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.provide('store', store);
app.mount('#app');
