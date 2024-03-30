import { createApp } from 'vue';
import App from './App.vue';

import { FromWithImport } from '@with-import/index';
import { FromWithoutImport } from '@without-import/index';
import { FromMaxDepth } from '@max-depth/index';

console.info(FromMaxDepth, FromWithImport, FromWithoutImport);

const app = createApp(App);
app.mount('#app');
