/* eslint-disable import/no-duplicates */
import initExample from '../../init';
import { a, b, aConst, e } from './packageA';
import { c } from './packageA';

console.info({ a, b, c, aConst, e });

if (import.meta.hot) {
  initExample(import.meta, 'issue 18');
}
