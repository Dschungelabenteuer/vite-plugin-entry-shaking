import { A_MODULE_A, A_MODULE_G, test } from '@entry-a';
import initExample from '../../init';

console.info(A_MODULE_A, A_MODULE_G, test);

if (import.meta.hot) {
  initExample(import.meta, 'Complete');
}
