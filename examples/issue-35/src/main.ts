import { Something, SomethingElse } from '@lib';
import initExample from '../../init';
import { name } from '../package.json';

console.info(Something, SomethingElse);

if (import.meta.hot) {
  initExample(import.meta, name);
}
