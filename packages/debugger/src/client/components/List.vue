<script setup lang="ts"></script>

<template>
  <div class="time">
    <div class="time__total">
      <Icon icon="tabler:clock" />
      <span class="label">Total process</span>
      <span class="duration">310ms</span>
    </div>
    <div class="time__details">
      <div class="entries">
        <Icon icon="tabler:target" />
        <span class="label">Entries analysis</span>
        <span class="duration">310ms</span>
      </div>
      <div class="transforms">
        <Icon icon="tabler:sparkles" />
        <span class="label">Transforms</span>
        <span class="duration">310ms</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.list {
  margin: var(--spacing-lg);
}
</style>
