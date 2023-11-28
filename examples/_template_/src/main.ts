import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import '@shared/styles/common.scss';
import { createChannel, routes } from '@shared/lib';
import App from './App.vue';
import { name } from '../package.json';

import { Something } from '@lib/index';

console.info(Something);

const store = createChannel(name, ['something']);
const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.provide('store', store);
app.mount('#app');
