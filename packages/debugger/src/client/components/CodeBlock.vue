<script setup lang="ts">
import type { ShikijiTransformer } from 'shikiji';
import { watchEffect, ref } from 'vue';
import { codeToHtml } from 'shikiji';

type CodeBlockProps = {
  /** Source code. */
  source: string;
  /** Code language. */
  lang?: 'ts' | 'javascript';
  /** Shikiji transformers. */
  transformers?: ShikijiTransformer[];
};

const props = withDefaults(defineProps<CodeBlockProps>(), {
  lang: 'ts',
  transformers: () => [],
  source: '',
});

const code = ref('');

watchEffect(async () => {
  code.value = await codeToHtml(props.source, {
    lang: 'javascript',
    transformers: props.transformers,
    theme: 'dracula-soft',
  });
});
</script>

<template>
  <div v-html="code" />
</template>

<style lang="scss">
.shiki {
  border-radius: var(--radius-md);
  overflow: auto;
  background: #1c151b !important;
}
.shiki code {
  padding: var(--spacing-lg);
  display: block;
  width: fit-content;
  min-width: 100%;
  line-height: 1.72;
  transition: color 0.5s;

  .line {
    margin-inline: calc(var(--spacing-lg) * -1);
    padding-inline: var(--spacing-lg);

    &.diff {
      width: calc(100% + 2 * var(--spacing-lg));
      display: inline-block;
    }
    &.remove {
      opacity: 0.7;
      background: #ff04043b;
    }

    &.add {
      background: #21e84b2b;
    }
  }
}
</style>
