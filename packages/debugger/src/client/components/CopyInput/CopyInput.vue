<script setup lang="ts">
import Input from '@components/Input/Input.vue';
import Button from '@components/Button/Button.vue';
import DropdownMenu from '@components/DropdownMenu/DropdownMenu.vue';
import { useClassNames } from '@composables/useClassNames';
import type { CopyInputProps } from './CopyInput.types';

const $class = useClassNames('copy-input');
const props = withDefaults(defineProps<CopyInputProps>(), {
  icon: undefined,
  copyLabel: 'Copy',
});
</script>

<template>
  <div :class="$class('path')">
    <Input
      id="entry-path"
      :model-value="value"
      :icon="icon"
      :readonly="true"
    >
      <template #after>
        <Button
          v-if="values.length === 1"
          :icon="values[0].icon ?? 'clipboard'"
          :floating-placement="'bottom-end'"
          :icon-only="true"
          :label="copyLabel"
          @click="() => console.log('clipboard copy')"
        />
        <Button
          v-else
          icon="clipboard"
          :floating-placement="'bottom-end'"
          :icon-only="true"
          :label="copyLabel"
        >
          <template #popover>
            <DropdownMenu
              :items="[
                { label: 'Copy absolute path', action: () => {} },
                { label: 'Copy relative name', action: () => {} },
              ]"
            />
          </template>
        </Button>
      </template>
    </Input>
  </div>
</template>
