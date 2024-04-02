<script setup lang="ts">
const model = defineModel<string>('default value');
</script>

<template>
  <label for="input">Name</label>
  <input id="input" v-model="model" placeholder="name" />
</template>