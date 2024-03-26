import { createTwoslashFromCDN } from 'twoslash-cdn';
import { createTransformerFactory, rendererRich } from '@shikijs/twoslash';
import { createStorage } from 'unstorage';
import indexedDbDriver from 'unstorage/drivers/indexedb';

export function useTwoSlash() {
  const driver = indexedDbDriver({ base: 'twoslash-cdn' });
  const compilerOptions = { lib: ['esnext', 'dom'] };
  const storage = createStorage({ driver });
  const twoslash = createTwoslashFromCDN({ storage, compilerOptions });
  const transformerTwoslash = createTransformerFactory(twoslash.runSync)({
    renderer: rendererRich(),
  });

  return { transformerTwoslash, twoslash };
}
