import { User, TestValue, AnotherUnused } from '@utils';
import initExample from '../../init';
import { name } from '../package.json';

User();
console.info(TestValue, AnotherUnused);

if (import.meta.hot) {
  initExample(import.meta, name);
}
