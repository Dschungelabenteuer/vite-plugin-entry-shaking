import { createApp } from 'vue';
import { Something } from '@lib/index';

function App() {
  return (
    <>
      <Something />
    </>
  );
}

createApp(App).mount('#app');
