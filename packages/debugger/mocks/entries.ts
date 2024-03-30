import { faker } from '@faker-js/faker';

import type { Context, EntryData, EntryExports, WildcardExports } from 'vite-plugin-entry-shaking';
import { getRandomProjectPath } from './utils';

const mockedEntryCount = 28;

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
    new Array(faker.number.int({ min: 2, max: 12 })).fill(0).map(() => {
      const importDefault = faker.datatype.boolean({ probability: 0.34 });
      const selfDefined = importDefault ? false : faker.datatype.boolean({ probability: 0.12 });
      return [
        faker.lorem.word(),
        {
          path: getRandomProjectPath(),
          importDefault,
          originalName: 'originalstring',
          alias: 'aliasstring',
          selfDefined,
        },
      ];
    }),
  );
}

// eslint-disable-next-line import/no-mutable-exports
export let diagnosticsCount = 0;

export const entries: Context['entries'] = new Map(
  new Array(mockedEntryCount).fill(0).map((): [string, EntryData] => {
    const timeOne = faker.number.float({ min: 0, max: 100, fractionDigits: 15 });
    const timeTwo = faker.number.float({ min: 0, max: 500, fractionDigits: 15 });
    const wildcardExports = mockWildcardExports();
    const exports = mockExports();
    const depth = faker.number.int({ min: 0, max: 1 });
    const diagnostics = new Array(faker.number.int({ min: 0, max: 3 })).fill(0).map(() => {
      diagnosticsCount += 1;
      return diagnosticsCount;
    });

    return [
      getRandomProjectPath(),
      {
        source: from,
        updatedSource: to,
        wildcardExports,
        depth,
        exports,
        isImplicit: faker.datatype.boolean({ probability: 0.12 }),
        diagnostics: new Set(diagnostics),
        importsCount: faker.number.int({ min: 0, max: 12 }),
        hits: faker.number.int({ min: 0, max: 8 }),
        time: Math.max(timeOne, timeTwo),
        self: Math.min(timeOne, timeTwo),
      },
    ];
  }),
);
