import { faker } from '@faker-js/faker';

import type { Context } from 'vite-plugin-entry-shaking';
import { getChronologicalTime } from './utils';

const mockedLogCount = 444; // Népal 🙏

export const logs: Context['logger']['logs'] = new Array(mockedLogCount)
  .fill(0)
  .map((_, index) => ({
    content: `${index + 1} ${faker.lorem.sentence({ min: 3, max: 22 })}`,
    level: faker.helpers.arrayElement(['info', 'warn', 'error', 'debug', 'success']),
    timestamp: getChronologicalTime(mockedLogCount, index),
  }));
