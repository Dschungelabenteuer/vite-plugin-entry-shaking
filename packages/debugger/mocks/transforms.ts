import { faker } from '@faker-js/faker';

import type { TransformData } from 'vite-plugin-entry-shaking';
import { getChronologicalTime, getRandomProjectPath } from './utils';

const mockedTransformCount = 64;

export const transforms: TransformData[] = new Array(mockedTransformCount)
  .fill(0)
  .map((_, index) => {
    const time = faker.number.int({ min: 0, max: 600 });
    return {
      time,
      id: getRandomProjectPath(),
      source: faker.lorem.sentence(),
      transformed: faker.lorem.sentence(),
      timestamp: getChronologicalTime(mockedTransformCount, index),
    } as TransformData;
  });
