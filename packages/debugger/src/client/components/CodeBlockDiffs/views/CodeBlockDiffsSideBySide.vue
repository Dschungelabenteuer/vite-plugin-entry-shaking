<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui';
import { useTemplateRef, watch } from 'vue';
import type { CodeBlockDiffsSideBySideProps } from '../CodeBlockDiffs.types';
import { useClassNames } from '@composables/useClassNames';
import CodeBlock from '@components/CodeBlock/CodeBlock.vue';
import { useMonacoScrollSync } from './useMonacoScrollSync';
import { useMonacoDiffs } from './useMonacoDiffs';

const props = defineProps<CodeBlockDiffsSideBySideProps>();
const $class = useClassNames('code-block-diffs-side-by-side');
const panelClass = $class('panel');
const resizeHandlerClass = $class('resize-handler');
const fromRef = useTemplateRef<InstanceType<typeof CodeBlock>>('fromRef');
const toRef = useTemplateRef<InstanceType<typeof CodeBlock>>('toRef');
const { handleChange } = useMonacoDiffs(toRef, fromRef);

useMonacoScrollSync(fromRef, toRef);

watch(
  () => [props.from, props.to] as const,
  ([from, to]) => handleChange(from, to),
  { immediate: true }
);
</script>

<template>
  <SplitterGroup
    :class="$class()"
    direction="horizontal"
    style="height: 100%; width: 100%"
  >
    <SplitterPanel :class="panelClass">
      <CodeBlock
        ref="fromRef"
        :content="from"
        language="javascript"
        :line-wrap
      />
    </SplitterPanel>
    <SplitterResizeHandle :class="resizeHandlerClass" />
    <SplitterPanel :class="panelClass">
      <CodeBlock
        ref="toRef"
        :content="to"
        language="javascript"
        :line-wrap
      />
    </SplitterPanel>
  </SplitterGroup>
</template>

<style lang="scss">
.code-block-diffs-side-by-side {
  &__panel {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__resize-handler {
    &[data-orientation='horizontal'] {
      width: 0.5rem;
    }

    &[data-orientation='vertical'] {
      height: 0.5rem;
    }
  }
}
</style>
