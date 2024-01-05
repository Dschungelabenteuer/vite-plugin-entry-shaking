<script setup lang="ts">
const modules = import.meta.glob('./cases/*.ts');

const cases: string[] = [
  'wildcard-import-reexport',
];

const loadCase = async (casePath: string) => {
  const mod = modules[`./cases/${casePath}.ts`];
  await mod();
  console.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
};
</script>

<template>
  <div>
    <h1>Syntax cases</h1>
    <ul>
      <li
        v-for="casePath in cases"
        :key="`${casePath}-index`"
      >
        <button @click="() => loadCase(casePath)">
          coucou
        </button>
      </li>
    </ul>
  </div>
</template>
