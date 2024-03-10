/** Query suffix name used to tell Vite to serve the original source file instead of the cleaned up one. */
export const SOURCE_QUERY_SUFFIX = 'source';

/**
 * Adds source query suffix to the file path.
 * When encountering the output path, Vite will serve the original source file instead of the cleaned up one.
 * @param id Path to the file.
 */
export function addSourceQuerySuffix(id: string) {
  const idEntities = id.split('?');
  const idParams = idEntities.length > 1 ? idEntities.pop() : undefined;
  const sourceId = idEntities.join('?');

  const params = new URLSearchParams(idParams);
  params.set(SOURCE_QUERY_SUFFIX, '1');

  return `${sourceId}?${params.toString()}`;
}

/**
 * Parses the file path and returns the original file path and whether to serve the source file.
 * @param id Path to the file.
 */
export function parseId(id: string) {
  const idEntities = id.split('?');
  const idParams = idEntities.length > 1 ? idEntities.pop() : undefined;
  const sourceId = idEntities.join('?');

  const params = new URLSearchParams(idParams);
  const serveSource = params.get(SOURCE_QUERY_SUFFIX) === '1';
  params.delete(SOURCE_QUERY_SUFFIX);

  const url = params.size ? `${sourceId}?${params.toString()}` : sourceId;
  return { url, serveSource };
}
