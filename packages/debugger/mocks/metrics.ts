import { faker } from '@faker-js/faker';

import type { Context } from 'vite-plugin-entry-shaking';

const analysis = faker.number.float({ min: 10, max: 700, fractionDigits: 15 });
const transform = faker.number.float({ min: 10, max: 1000, fractionDigits: 15 });
const miscTime = faker.number.float({ min: 10, max: 100, fractionDigits: 15 });
const process = analysis + transform + miscTime;

export const metrics: Context['metrics'] = {
  analysis,
  transform,
  process,
  jsRequests: faker.number.int({ min: 10, max: 100 }),
  otherRequests: faker.number.int({ min: 10, max: 100 }),
};
