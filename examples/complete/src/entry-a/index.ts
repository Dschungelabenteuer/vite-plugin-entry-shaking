import A_MODULE_D from '@entry-a/modules/D';
import A_MODULE_A from './modules/A';
import A_MODULE_B from './modules/B';
import A_MODULE_C from './modules/C';

import { A_MODULE_E, A_MODULE_F } from './modules/EF';
import { G as A_MODULE_G } from './modules/G';

export { A_MODULE_H } from './modules/H';
export { default as A_MODULE_I, J as A_MODULE_J } from './modules/IJ';
export { A_MODULE_A };
export { A_MODULE_B };
export { A_MODULE_C, A_MODULE_D };
export {
  A_MODULE_E,
  A_MODULE_F,
};

export { A_MODULE_G };

export const test = 'test';

export default () => {

};
