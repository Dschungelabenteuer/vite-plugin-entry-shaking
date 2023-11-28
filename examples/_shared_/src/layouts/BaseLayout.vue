<script setup lang="ts">
import { provide } from 'vue';
import type { ChannelStore } from '../channel';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import ExpectationsPanel from '../components/ExpectationsPanel.vue';
import { useColorScheme } from '../composables/useColorScheme';
import { useExpectationsPanel } from '../composables/useExpectationsPanel';

const props = defineProps<{ store: ChannelStore }>();
const { colorScheme, swapColorScheme } = useColorScheme();
const expectationsPanel = useExpectationsPanel();
provide('store', props.store);
provide('expectationsPanel', expectationsPanel);
provide('colorScheme', colorScheme);
provide('swapColorScheme', swapColorScheme);
const { isOpen } = expectationsPanel;
</script>

<template>
  <div
    class="base-wrapper"
    :data-color-scheme="colorScheme"
  >
    <div class="base-layout">
      <Header />
      <main>
        <slot />
      </main>
      <Footer />
    </div>
    <ExpectationsPanel
      v-show="isOpen"
      class="panel"
    />
  </div>
</template>

<style lang="scss">
@import '../styles/mixins';

.base-wrapper {
  @include contained;
  display: flex;
  color: var(--text-color);
  background: var(--background-color);
  background-image: var(--background-gradient);
}

.base-layout {
  @include contained;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: var(--size-header) 1fr var(--size-footer);
}

main {
  flex-grow: 1;
  border-radius: var(--radius-md);
  max-height: var(--size-page);
  overflow-y: auto;
}
</style>
