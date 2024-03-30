<script setup lang="ts">
import { store } from '#store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { randomId } from '#utils';
import Button from '@components/Button/Button.vue';
import Dialog from '@components/Dialog/Dialog.vue';
import MetricsBlock from '@components/MetricsBlock/MetricsBlock.vue';
import { useClassNames } from '@composables/useClassNames';
import type { DiagnosticsProps } from './Metrics.types';
import DiagnosticsOverview from './details/DiagnosticsOverview.vue';

const $class = useClassNames('diagnostics');
const props = defineProps<DiagnosticsProps>();
const dialogRef = ref<InstanceType<typeof Dialog> | null>(null);
const route = useRoute();
const router = useRouter();

const generateId = () => randomId('diagnostics-dialog');
const dialogId = ref(generateId());
const shown = ref(true);

const redirectToFileDiagnostics = async (path: string) => {
  dialogRef.value?.element?.close();
  router.push({ name: 'Entry', params: { path, tab: 'diagnostics' } });
};

watch(route, () => {
  dialogId.value = generateId();
});
</script>

<template>
  <div :class="$class()">
    <MetricsBlock
      :header
      :details
    />
    <Button
      label="Open diagnostics overview"
      :class="[$class('button'), 'bordered']"
      @click="dialogRef?.element?.showModal()"
    />
    <Dialog
      ref="dialogRef"
      title="Diagnostics overview"
      width="760px"
      height="640px"
      :unpad="true"
    >
      <DiagnosticsOverview
        v-if="shown"
        :diagnostics="store.diagnostics"
        @end-reached="() => dialogRef?.focusFirst()"
        @view="redirectToFileDiagnostics"
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
.diagnostics {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &__button {
    align-self: center;
    width: calc(100% - 2 * var(--spacing-lg));
  }
}
</style>
