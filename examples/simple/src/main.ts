import { User, TestValue } from '@utils';
import initExample from '../../init';

User();
console.info(TestValue);

if (import.meta.hot) {
  initExample(import.meta, 'Simple');
}
