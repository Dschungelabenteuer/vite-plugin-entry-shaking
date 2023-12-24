import { faker } from '@faker-js/faker';

import type { Context, EntryData, EntryExports, WildcardExports } from 'vite-plugin-entry-shaking';

const mockedEntryCount = 34;

const from = `import Lol from 'lol';
import { ref, Item } from 'vue';
import { baz, foo, fer } from 'somewhere';
import Pouet from 'Pouet';
import Prout from 'prout';

const a = 1;

`;
const to = `import Lol from 'lol';
import { Item } from 'vue';
import { baz, bar, fer } from 'somewhere';
import Pouet from 'Pouet';
import Prout from 'prout';


const odd = true;

const new1 = 1;
const new2 = 2;
`;

const getRandomProjectPath = () => `~/path/to/project/src${faker.system.filePath()}`;

function mockWildcardExports(): WildcardExports {
  const numberOfDirectExports = faker.number.int({ min: 0, max: 2 });
  const numberOfNamedExports = faker.number.int({ min: 0, max: 3 });
  return {
    named: new Map(
      new Array(numberOfNamedExports)
        .fill(0)
        .map(() => [faker.lorem.word(), getRandomProjectPath()]),
    ),
    direct: new Array(numberOfDirectExports).fill(0).map(() => getRandomProjectPath()),
  };
}

function mockExports(): EntryExports {
  return new Map(
    new Array(faker.number.int({ min: 0, max: 3 })).fill(0).map(() => [
      faker.lorem.word(),
      {
        path: getRandomProjectPath(),
        importDefault: false,
        originalName: 'originalstring',
        alias: 'aliasstring',
        selfDefined: true,
      },
    ]),
  );
}

export const entries: Context['entries'] = new Map(
  new Array(mockedEntryCount).fill(0).map((): [string, EntryData] => {
    const wildcardExports = mockWildcardExports();
    const exports = mockExports();
    const depth = faker.number.int({ min: 0, max: 1 });
    return [
      getRandomProjectPath(),
      {
        source: from,
        updatedSource: to,
        wildcardExports,
        depth,
        exports,
      },
    ];
  }),
);
