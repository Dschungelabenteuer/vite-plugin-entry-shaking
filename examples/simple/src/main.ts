import { a, b } from '@folder';
import initExample from '../../init';

console.info(a);
console.info(b);

if (import.meta.hot) {
  initExample(import.meta, 'Simple');
}
