import * as Utils from '@utils';
import { C } from './utils/C';
import initExample from '../../init';
import { name } from '../package.json';

/**
 * C is manually re-imported to illustrate potential collisions between
 * tree-shaking its statement triggers and the effects it may have on the
 * whole Utils state.
 *
 * In versions <= 0.3.2, such a scenario would result in `Utils` only exposing
 * `A` and `B` because the served module would be the one that was proceeded
 * (and cleaned up) in the early entry analysis stage.
 *
 * Despite this being a weird practice, this could still lead to undesired
 * and hard-to-track issues. Instead, in such scenarios, we should serve
 * the original entry file.
 */

console.info(Utils, C);

if (import.meta.hot) {
  initExample(import.meta, name);
}
