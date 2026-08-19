export const SourceDiffFrom = `import Timeflies from 'timeflies';
import { ref, Item } from 'vue';
import { baz, foo, fer } from 'somewhere';
import { res, val } from 'luv';
import Prout from 'prout';

const a = 1;

`;

export const SourceDiffTo = `import Timeflies from 'timeflies';
import { Item } from 'vue';
import { baz, bar, fer } from 'somewhere';
import { res, val } from 'luv';
import Prout from 'prout';

/** Determines whether this is odd. */
const odd = true;

const new1 = 1;
const new2 = 2;
`;
