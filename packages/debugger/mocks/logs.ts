import { faker } from '@faker-js/faker';

import type { Context } from 'vite-plugin-entry-shaking';
import { getChronologicalTime } from './utils';

const mockedLogCount = 444; // Népal 🙏

export const logs: Context['logger']['logs'] = new Array(mockedLogCount)
  .fill(0)
  .map((_, index) => ({
    content: faker.lorem.sentence(),
    level: faker.helpers.arrayElement(['info', 'warn', 'error', 'debug']),
    timestamp: getChronologicalTime(mockedLogCount, index),
  }));
