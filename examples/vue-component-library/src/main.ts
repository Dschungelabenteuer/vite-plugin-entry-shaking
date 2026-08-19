import { createApp } from 'vue';
import App from './App.vue';

import { Something } from '@lib/index';

console.info(Something);

const app = createApp(App);
app.mount('#app');
