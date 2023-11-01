export const SOURCE_QUERY_SUFFIX = 'source';

export const addSourceQuerySuffix = (id: string) => {
  const idEntities = id.split('?');
  const idParams = idEntities.length > 1 ? idEntities.pop() : undefined;
  const sourceId = idEntities.join('?');

  const params = new URLSearchParams(idParams);
  params.set(SOURCE_QUERY_SUFFIX, '1');

  return `${sourceId}?${params.toString()}`;
};

export const parseId = (id: string) => {
  const idEntities = id.split('?');
  const idParams = idEntities.length > 1 ? idEntities.pop() : undefined;
  const sourceId = idEntities.join('?');

  const params = new URLSearchParams(idParams);
  const serveSource = params.get(SOURCE_QUERY_SUFFIX) === '1';
  params.delete(SOURCE_QUERY_SUFFIX);

  const url = params.size ? `${sourceId}?${params.toString()}` : sourceId;
  return { url, serveSource };
};
