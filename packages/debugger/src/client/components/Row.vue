<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { roveFocusableChildren } from '@composable/useDataGrid';
import type { Column } from '@views/GridView.vue';

const rowRef = ref<HTMLElement | undefined>();
const emit = defineEmits<{ cellClick: [row: number, col: number] }>();
const props = defineProps<{ rowIndex: number; columns: Column[] }>();

const prepareRow = () => {
  const children = [...(rowRef.value?.children ?? [])];
  // Warn if number of children mismatch the number of columns.
  if (children.length !== Number(props.columns.length)) {
    console.warn(
      `[Grid warn] Columns and children count mismatch.\n` +
        `The following element is expected to have ${props.columns.length} children ` +
        `but has actually ${rowRef.value?.children.length}. This may cause both ` +
        `styling and accessibility issues:\n`,
      rowRef.value,
    );
  }

  // Dynamically rove and add aria-colindex to children.
  (children as HTMLElement[]).forEach((child, index) => {
    roveFocusableChildren(child);
    const className = props.columns[index].class;
    child.removeEventListener('click', handleClick);
    child.setAttribute('aria-colindex', `${index + 1}`);
    child.setAttribute('data-rowindex', `${props.rowIndex + 2}`);
    if (className) child.classList.add(className);
    child.addEventListener('click', handleClick, { capture: true });
  });
};

const handleClick = (e: MouseEvent) => {
  const row = props.rowIndex + 2;
  const col = Number((e.currentTarget as HTMLElement).getAttribute('aria-colindex')) ?? 0;
  console.log('@@@@ clicked', row, col);
  emit('cellClick', row, col);
};
</script>

<template>
  <div
    ref="rowRef"
    class="grid__row"
  >
    <slot :on-rendered="() => prepareRow()" />
  </div>
</template>
