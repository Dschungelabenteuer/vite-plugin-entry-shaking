import { faker } from '@faker-js/faker';

export function getChronologicalTime(count: number, index: number) {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);

  const start = yesterday.setHours(23, 37, 0, 0);
  const end = today.setHours(0, 48, 0, 0);
  const step = Math.round((end - start) / count);
  const out = start + Math.round(step * (index + 1));
  return out;
}
export const root = '~/path/to/project';

export const getRandomProjectPath = () => `${root}/src${faker.system.filePath()}`;
