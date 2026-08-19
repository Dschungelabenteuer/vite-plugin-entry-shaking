<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import type { CodeBlockDiffsProps } from './CodeBlockDiffs.types';
import { useClassNames } from '@composables/useClassNames';
import Dialog from '@components/Dialog/Dialog.vue';
import Button from '@components/Button/Button.vue';
import CodeBlockDiffsSimple from './views/CodeBlockDiffsSimple.vue';
import CodeBlockDiffsSideBySide from './views/CodeBlockDiffsSideBySide.vue';

const props = defineProps<CodeBlockDiffsProps>();
const $class = useClassNames('code-block-diffs');
const dialogRef = useTemplateRef<InstanceType<typeof Dialog>>('dialogRef');
const mode = ref<CodeBlockDiffsProps['mode']>(props.mode ?? 'simple');

const switchMode = () => {
  mode.value = mode.value === 'simple' ? 'side-by-side' : 'simple';
};

watch(
  () => mode.value || props.mode,
  (mode) => {
    if (mode === 'side-by-side') {
      dialogRef.value?.element?.showModal();
    } else {
      dialogRef.value?.element?.close();
    }
  }
);
</script>

<template>
  <div :class="$class()">
    <Button
      :class="$class('switch')"
      label="Side by side"
      @click="switchMode"
    />
    <CodeBlockDiffsSimple
      :from
      :to
      :line-wrap
    />
    <Dialog
      ref="dialogRef"
      title="Transform diff side-by-side"
      width="1280px"
      height="780px"
    >
      <CodeBlockDiffsSideBySide
        :from
        :to
        :line-wrap
      />

      <template #footer>
        <Button
          label="Close"
          icon="x"
          shortcut="ESC"
          :bordered="true"
          :class="['bordered', 'small']"
          @click="dialogRef?.element?.close()"
        />
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss">
.code-block-diffs {
  height: 100%;

  &__switch {
    position: absolute;
    bottom: var(--spacing-lg);
    right: var(--spacing-lg);
    z-index: 10;
    background: var(--toast-background-color);
  }
}

.diff {
  &-added {
    background: rgba(16, 185, 129, 0.15);
  }

  &-added-inline {
    background-color: rgba(16, 185, 129, 0.3);
  }

  &-removed {
    background: rgba(239, 68, 68, 0.15);
  }

  &-removed-inline {
    background-color: rgba(239, 68, 68, 0.3);
  }
}
</style>
