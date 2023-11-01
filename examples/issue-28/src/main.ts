import { Bar } from '@utils';
import initExample from '../../init';

/**
 * This is where Bar would be used, but what about Foo?
 * It's not imported, not even exported from the target file
 * - where would it be needed?
 * - where's that "undesired tree-shaking" happening?
 *
 */
console.info(Bar);

if (import.meta.hot) {
  initExample(import.meta, 'issue 28');
}
