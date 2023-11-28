import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import '@shared/styles/common.scss';
import { createChannel, routes } from '@shared/lib';
import App from './App.vue';
import { name } from '../package.json';

import { NamedExport,
  NamedExportDupe,
  NamedExportOne,
  NamedExportOneDupe,
  NamedExport2,
  NamedExport2Dupe,
  NamedExport3,
  NamedExport3Dupe,
  DefaultExport,
  DefaultExportDupe } from '@lib/index';

console.info({
  NamedExport,
  NamedExportDupe,
  NamedExportOne,
  NamedExportOneDupe,
  NamedExport2,
  NamedExport2Dupe,
  NamedExport3,
  NamedExport3Dupe,
  DefaultExport,
  DefaultExportDupe,
  NamedExportMultiple,
  MixedExport,
});

const store = createChannel(name, ['something']);
const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.provide('store', store);
app.mount('#app');
