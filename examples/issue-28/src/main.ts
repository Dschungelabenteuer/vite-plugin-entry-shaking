import { Bar } from './second';
import { SomeContent as MyContent } from './some-file';
import { Flyout as FlyoutBase } from './alias';

export const Flyout = () => `!${FlyoutBase}`;

/**
 * This is where Bar would be used, but what about Foo?
 * It's not imported, not even exported from the target file
 * - where would it be needed?
 * - where's that "undesired tree-shaking" happening?
 *
 */
console.info(MyContent, FlyoutBase, Bar);
