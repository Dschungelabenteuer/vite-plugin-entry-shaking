import { describe, it, expect } from 'vitest';
import dedent from 'ts-dedent';

import Parsers from '../src/parse';

/**
 * Both methods are directly connected but split for readability. Because
 * `parseImportStatementContent`is only called from `parseImportStatement`,
 * let's just test the latter's I/O.
 */

describe('parseImportStatement & parseImportStatementContent', () => {
  describe('aggregated statements', () => {
    it('should correctly parse aggregated export statement', () => {
      const firstNamedImport = 'UserId';
      const secondNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        `export { ${firstNamedImport}, ${secondNamedImport} } from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: ['UserId', 'UserName'],
        defaultImports: [],
      });
    });

    it('should correctly parse aggregated export statement with alias', () => {
      const firstNamedImport = 'UserId as UserIdentifier';
      const secondNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        `export { ${firstNamedImport}, ${secondNamedImport} } from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: [firstNamedImport, secondNamedImport],
        defaultImports: [],
      });
    });

    it('should correctly parse aggregated export statement with only aliased default export', () => {
      const defaultImports = ['User'];
      const parsed = Parsers.parseImportStatement(
        `export { default as ${defaultImports[0]} } from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: [],
        defaultImports,
      });
    });

    it('should correctly parse aggregated export statement with aliased default export', () => {
      const defaultImports = ['User'];
      const firstNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        `export { default as ${defaultImports[0]}, ${firstNamedImport} } from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: ['UserName'],
        defaultImports,
      });
    });

    it('should correctly parse multiline export statement', () => {
      const firstNamedImport = 'UserId';
      const secondNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        dedent(`export {
          ${firstNamedImport},
          ${secondNamedImport},
        } from '@model/user';`),
      );
      expect(parsed).toMatchObject({
        namedImports: [firstNamedImport, secondNamedImport],
        defaultImports: [],
      });
    });
  });

  describe('import statements', () => {
    it('should correctly parse import statement when only importing named exports', () => {
      const firstNamedImport = 'UserId';
      const secondNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        `import { ${firstNamedImport}, ${secondNamedImport} } from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: [firstNamedImport, secondNamedImport],
        defaultImports: [],
      });
    });

    it('should correctly parse import statement when only importing default export', () => {
      const defaultImports = ['User'];
      const parsed = Parsers.parseImportStatement(`import ${defaultImports} from '@model/user';`);
      expect(parsed).toMatchObject({
        namedImports: [],
        defaultImports,
      });
    });

    it('should correctly parse import statement when importing default export then named exports', () => {
      const defaultImports = ['User'];
      const firstNamedImport = 'UserId';
      const secondNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        `import ${defaultImports[0]}, { ${firstNamedImport}, ${secondNamedImport} } from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: [firstNamedImport, secondNamedImport],
        defaultImports,
      });
    });

    /** This is not valid syntax, but let's keep it to still test parse mechanics. */
    it.skip('should correctly parse import statement when importing named exports then default export', () => {
      const defaultImports = ['User'];
      const firstNamedImport = 'UserId';
      const secondNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        `import { ${firstNamedImport}, ${secondNamedImport} }, ${defaultImports[0]} from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: [firstNamedImport, secondNamedImport],
        defaultImports,
      });
    });

    it('should correctly parse import statement when importing named exports with aliases', () => {
      const defaultImports = ['User'];
      const firstNamedImport = 'UserId as Identifier';
      const secondNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        `import ${defaultImports[0]}, { ${firstNamedImport}, ${secondNamedImport} } from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: [firstNamedImport, secondNamedImport],
        defaultImports,
      });
    });

    it('should correctly parse import statement when importing default export with alias', () => {
      const defaultImports = ['User'];
      const firstNamedImport = 'UserName';
      const parsed = Parsers.parseImportStatement(
        `import { default as ${defaultImports[0]}, ${firstNamedImport} } from '@model/user';`,
      );
      expect(parsed).toMatchObject({
        namedImports: [firstNamedImport],
        defaultImports,
      });
    });
  });
});

describe('parseImportParams', () => {
  it('should return correct structure when there is no alias', () => {
    const name = 'User';
    expect(Parsers.parseImportParams(name)).toStrictEqual({
      name,
      alias: undefined,
    });
  });

  it('should return correct structure when there is an alias', () => {
    const name = 'User';
    const alias = 'UserProfile';
    expect(Parsers.parseImportParams(`${name} as ${alias}`)).toStrictEqual({ name, alias });
  });
});
