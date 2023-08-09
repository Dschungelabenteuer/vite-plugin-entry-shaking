/* eslint-disable import/no-duplicates */
import initExample from '../../init';
import { a, b } from './packageA';
import { c } from './packageA';

console.info({ a, b, c });

if (import.meta.hot) {
  initExample(import.meta, 'issue 18');
}
