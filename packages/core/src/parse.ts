import type { ParsedImportStatement } from './types';

/**
 * Parses an import statement to extract default and named exports.
 * @param statement Import statement to parse.
 */
export function parseImportStatement(statement: string): ParsedImportStatement {
  const output: ParsedImportStatement = { namedImports: [], defaultImports: [] };
  const inlineStatement = statement.replace(/\n/g, '');
  const [, , importContent] = inlineStatement.match(/(im|ex)port (.*) from/m) ?? [, , undefined];
  return importContent ? methods.parseImportStatementContent(importContent) : output;
}

/**
 * Parses an import statement's content to extract default and named exports.
 * @param statement Import statement to parse.
 */
export function parseImportStatementContent(importContent: string) {
  const output: ParsedImportStatement = { namedImports: [], defaultImports: [] };

  const registerNamedImport = (s: string) => {
    const name = s.trim();
    if (name.length) output.namedImports.push(name);
  };

  const registerDefaultImport = (s: string) => {
    const name = s.trim();
    if (name.length) output.defaultImports.push(name);
  };

  const def = [, undefined];
  const [namedImportsStatement, namedImportsContent] = importContent.match(/{(.*)}/) ?? def;
  if (namedImportsStatement && namedImportsContent) {
    importContent = importContent.replace(namedImportsStatement, '');
    namedImportsContent.split(',').forEach((namedImport) => {
      const name = namedImport.split(' as ')!.map((param) => param.trim());
      if (name.length === 1) {
        registerNamedImport(name[0]);
      } else {
        const [originalName, alias] = name;
        if (originalName === 'default') {
          registerDefaultImport(alias);
        } else {
          registerNamedImport(namedImport);
        }
      }
    });
  }

  const defaultImport = importContent.replace(/,/g, '').trim();
  if (defaultImport.length) registerDefaultImport(defaultImport);

  return output;
}

/**
 * Returns the import params of a single imported entity.
 * @param importString Import statement string.
 */
export function parseImportParams(importString: string) {
  const [name, alias] = importString.trim().split(' as ');
  return { name, alias };
}

const methods = {
  parseImportStatementContent,
  parseImportStatement,
  parseImportParams,
};

export default methods;
