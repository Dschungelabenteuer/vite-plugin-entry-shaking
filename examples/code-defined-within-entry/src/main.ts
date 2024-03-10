import { createApp } from 'vue';
import App from './App.vue';

import { FromWithImport } from '@with-import/index';
import { FromWithoutImport } from '@without-import/index';

console.info(FromWithImport, FromWithoutImport);

const app = createApp(App);
app.mount('#app');
