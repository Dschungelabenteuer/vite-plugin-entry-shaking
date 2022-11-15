import { A_MODULE_A, A_MODULE_G, test } from '@entry-a';
import { Button } from 'components';
import initExample from '../../init';

console.info(A_MODULE_A, A_MODULE_G, test, Button);

if (import.meta.hot) {
  initExample(import.meta, 'Complete');
}
