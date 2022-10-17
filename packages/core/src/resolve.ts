import type { Alias } from 'vite';
import { normalizePath } from 'vite';
import { resolve } from 'path';

export const handleAliases = (
  path: string,
  aliases: Alias[],
) => {
  let outputPath = path;
  for (const { find, replacement } of aliases) {
    const matches = typeof find === 'string'
      ? path.startsWith(find)
      : find.test(path);
    if (matches) {
      outputPath = path.replace(find, replacement);
    }
  }

  return outputPath;
};

export default function resolveId(
  id: string,
  path: string,
  aliases: Alias[],
) {
  const cleanedPath = handleAliases(path, aliases);
  return normalizePath(cleanedPath !== path
    ? cleanedPath
    : resolve(
      id.split('/').slice(0, -1).join('/'),
      path,
    ));
}
