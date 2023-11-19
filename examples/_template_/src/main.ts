import { Something } from '@lib';
import initExample from '../../init';
import { name } from '../package.json';

console.info(Something);

if (import.meta.hot) {
  initExample(import.meta, name);
}
