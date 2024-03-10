<script setup lang="ts">
import { inject } from 'vue';
import type { TransformDetailsProps } from '../TransformDetails.vue';

const transformDetails = inject<TransformDetailsProps>('transform-details')!;
</script>

<template>
  <div>
    time: {{ transformDetails.transform?.time }}ms
    <div>hello transform metrics</div>
  </div>
</template>
