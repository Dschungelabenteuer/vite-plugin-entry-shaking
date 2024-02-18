<script setup lang="ts">
import summary from './data/summary.json';

type GroupData = Record<string, ExampleData>;

type ExampleData = {
  exampleName: string;
  examplePath: string;
  exampleDescription: string;
};

const groups = summary as [string, GroupData][];
const openExample = async (path: string) => {
  const [_, __, newPath] = path.split(/src(\\|\/)/);
  const relPath = `./${newPath}`;
  await import(/* @vite-ignore */ relPath);
};
</script>

<template>
  <div class="wrapper">
    <h1>Syntax cases</h1>
    <div
      v-for="[groupName, groupCases] in groups"
      :key="groupName"
      class="group"
    >
      <h2>{{ groupName }}</h2>
      <div
        v-for="{ exampleName, examplePath, exampleDescription } in Object.values(groupCases)"
        :key="`${groupName}-${exampleName}`"
        class="case"
      >
        <div>
          <h3>{{ exampleName }}</h3>
          <p>{{ exampleDescription }}</p>
          <button @click="() => openExample(examplePath)">
            Load file
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  font-family:sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f6f8;
}

.wrapper {
  max-width: 800px;
  margin-inline: auto;
  padding: 1rem;
}

.case {
  display: flex;
  width: 100%;;
  align-self: center;
  padding: 0.5rem 1rem;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  background-color: #fff;
  margin-block: 1rem;
}

.case > div:nth-child(2) {
  align-self: center;
  justify-self: flex-end;
}
</style>
