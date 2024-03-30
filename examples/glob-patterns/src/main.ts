import { createApp } from 'vue';
import App from './App.vue';

import { Something } from '@lib/index';
import { FooOne, FooTwo } from '@entries/foo';
import { BarOne, BarTwo } from '@entries/bar';
import { BazOne, BazTwo } from '@entries/baz';

console.info({
  Something,
  FooOne,
  FooTwo,
  BarOne,
  BarTwo,
  BazOne,
  BazTwo,
});

const app = createApp(App);
app.mount('#app');
