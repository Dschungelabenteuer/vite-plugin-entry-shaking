import { Bar } from './second';

/**
 * This is where Bar would be used, but what about Foo?
 * It's not imported, not even exported from the target file
 * - where would it be needed?
 * - where's that "undesired tree-shaking" happening?
 *
 */
console.info(Bar);