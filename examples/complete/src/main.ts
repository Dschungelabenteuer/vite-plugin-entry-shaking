import {
  A_MODULE_A,
  A_MODULE_A as A_COPY,
  A_MODULE_B as B,
  A_MODULE_G,
  A_MODULE_J as JJ,
  A_MODULE_D,
  test,
} from '@entry-a';
import initExample from '../../init';

console.info(A_MODULE_A, A_COPY, A_MODULE_G, A_MODULE_D, B, JJ, test);

if (import.meta.hot) {
  initExample(import.meta, 'Complete');
}
