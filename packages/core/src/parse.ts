import type { ParsedImportStatement } from './types';

/**
 * Parses an import statement to extract default and named exports.
 * @param statement Import statement to parse.
 */
export function parseImportStatement(statement: string): ParsedImportStatement {
  const output: ParsedImportStatement = {
    namedImports: [],
    defaultImports: [],
    wildcardImport: undefined,
  };

  const [, , importContent] = /(im|ex)port\s+((.|\n)*)\s+from/.exec(statement) ?? [, , undefined];
  return importContent ? methods.parseImportStatementContent(importContent) : output;
}

/**
 * Parses an import statement's content to extract default and named exports.
 * @param statement Import statement to parse.
 */
export function parseImportStatementContent(importContent: string) {
  const output: ParsedImportStatement = {
    namedImports: [],
    defaultImports: [],
    wildcardImport: undefined,
  };

  const registerImport = (target: 'namedImports' | 'defaultImports') => (s: string) => {
    const name = s.trim().replace(/\n/g, ' ');
    if (name.length) output[target].push(name);
  };

  const registerNamedImport = registerImport('namedImports');
  const registerDefaultImport = registerImport('defaultImports');
  const registerWildcardImport = (s: string) => {
    output.wildcardImport = s.trim();
  };

  const def = [, undefined];
  const [namedImportsStatement, namedImportsContent] = /{([\s\S]*)}/.exec(importContent) ?? def;
  if (namedImportsStatement && namedImportsContent) {
    importContent = importContent.replace(namedImportsStatement, '');
    namedImportsContent.split(',').forEach((namedImport) => {
      const name = namedImport.split(/\s+as\s+/).map((param) => param.trim());
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

  if (defaultImport.startsWith('*')) {
    registerWildcardImport(defaultImport);
  } else if (defaultImport.length) {
    registerDefaultImport(defaultImport);
  }

  return output;
}

/**
 * Returns the import params of a single imported entity.
 * @param importString Import statement string.
 */
export function parseImportParams(importString: string) {
  const [name, matchAlias] = importString.trim().split(/\s+as\s+/);
  const alias = matchAlias as string | undefined;
  return { name, alias };
}

const methods = {
  parseImportStatementContent,
  parseImportStatement,
  parseImportParams,
};

export default methods;
