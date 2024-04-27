import { createApp } from 'vue';
import App from './App.vue';

const { Something } = await import('@lib/index');

console.info(Something);

const app = createApp(App);
app.mount('#app');
