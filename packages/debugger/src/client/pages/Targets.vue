<script setup lang="ts">
import { computed } from 'vue';

import type { TargetProps } from '../components/Target.vue';
import TitledLayout from '../layouts/TitledLayout.vue';
import Target from '../components/Target.vue';
import { store } from '../store';

const targets = computed((): TargetProps[] =>
  [...store.entries.entries()].map(([path, target]) => ({
    ...target,
    relativePath: path.replace(store.rootDir, ''),
    path,
  })),
);
</script>

<template>
  <TitledLayout
    name="Targets"
    page-icon="tabler:target-arrow"
  >
    <Target
      v-for="target in targets"
      :key="target.relativePath"
      v-bind="target"
    />
  </TitledLayout>
</template>
