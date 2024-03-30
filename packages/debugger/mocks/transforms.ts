import { faker } from '@faker-js/faker';

import type { TransformData } from 'vite-plugin-entry-shaking';
import { getChronologicalTime, getRandomProjectPath } from './utils';

const mockedTransformCount = 64;

const source = `import { Something, SomethingElse } from '@somewhere';`;
const transformed = `import { Something } from '@somewhere/one';\nimport { SomethingElse } from '@somewhere/two';`;

export const transforms: TransformData[] = new Array(mockedTransformCount).fill(0).map(
  (_, index) =>
    ({
      time: faker.number.float({ min: 0, max: 600, fractionDigits: 15 }),
      id: getRandomProjectPath(),
      source,
      transformed,
      timestamp: getChronologicalTime(mockedTransformCount, index),
      entriesMatched: faker.number.int({ min: 1, max: 3 }),
      potentialRequestsAvoided: faker.number.int({ min: 1, max: 15 }),
    }) satisfies TransformData,
);
