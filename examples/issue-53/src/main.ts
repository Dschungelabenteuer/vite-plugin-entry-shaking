import { createApp } from 'vue';
import App from './App.vue';

import { Hello } from './lib';

console.info(Hello);

Hello.helloWorld();

const app = createApp(App);
app.mount('#app');
