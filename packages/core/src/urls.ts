export const SOURCE_QUERY_SUFFIX = 'source';

export const addSourceQuerySuffix = (url: string) => {
  const sourceUrl = new URL(url);
  sourceUrl.searchParams.set(SOURCE_QUERY_SUFFIX, '1');
  return sourceUrl.toString();
};

export const parseId = (url: string) => {
  const sourceUrl = new URL(url);
  const serveSource = sourceUrl.searchParams.get(SOURCE_QUERY_SUFFIX) === '1';
  sourceUrl.searchParams.delete(SOURCE_QUERY_SUFFIX);
  return { url: sourceUrl.toString(), serveSource };
};
