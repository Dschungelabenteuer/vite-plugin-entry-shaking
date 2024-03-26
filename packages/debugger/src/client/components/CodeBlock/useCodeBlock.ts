import type { ShikiTransformer } from 'shiki';
import { codeToHtml } from 'shiki';
import { ref, watchEffect } from 'vue';
import { transformerNotationDiff } from '@shikijs/transformers';

import type { CodeBlockProps } from './CodeBlock.types';
import { useDiffs } from './useDiffs';

export function useCodeBlock(props: CodeBlockProps) {
  const code = ref('');

  const getTransformers = async (): Promise<ShikiTransformer[]> => {
    const transformers = props.transformers ?? [];

    if (props.source && props.target) transformers.push(transformerNotationDiff());

    if (['typescript', 'ts'].includes(props.lang!) && !props.target) {
      const { useTwoSlash } = await import('./useTwoSlash');
      const { transformerTwoslash, twoslash } = useTwoSlash();
      await twoslash.prepareTypes(props.source);
      transformers.push(transformerTwoslash);
    }

    return transformers;
  };

  watchEffect(async () => {
    if (props.source && props.target) {
      const diffs = useDiffs();
      await diffs.prepare();
      diffs.compare('lol', props.source, props.target).then(async (val) => {
        code.value = await codeToHtml(val, {
          lang: props.lang!,
          theme: props.theme!,
          transformers: await getTransformers(),
        });
      });
    } else {
      code.value = await codeToHtml(props.source, {
        lang: props.lang!,
        theme: props.theme!,
        transformers: await getTransformers(),
      });
    }
  });

  return { code };
}
