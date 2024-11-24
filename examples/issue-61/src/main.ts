import { createApp } from 'vue';
import App from './App.vue';

import { util1 } from './utils/index';

console.info(util1);

const app = createApp(App);
app.mount('#app');
