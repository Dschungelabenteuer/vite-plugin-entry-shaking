import { createApp } from 'vue';
import App from './App.vue';

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
});

const app = createApp(App);
app.mount('#app');
