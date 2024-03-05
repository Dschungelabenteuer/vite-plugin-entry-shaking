import { createApp } from 'vue';

import './styles/common.scss';
import App from './App.vue';
import { createRouter } from './routes';
import { useHotModule } from './composables/useHotModule';

useHotModule();

const app = createApp(App);
const router = createRouter();
app.use(router);
app.mount('#app');
