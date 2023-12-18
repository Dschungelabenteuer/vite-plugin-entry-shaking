<script setup lang="ts">
import { computed } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import TitledLayout from '../layouts/TitledLayout.vue';
import Log from '../components/Log.vue';
import { store } from '../store';

const logs = computed(() => store.logs?.map((log, index) => ({ ...log, id: index, index })));
</script>

<template>
  <TitledLayout
    name="Logs"
    page-icon="tabler:clipboard-text"
  >
    <DynamicScroller
      :items="logs"
      :min-item-size="48"
      :emit-update="true"
      class="scroller"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          :data-index="index"
          :data-active="active"
        >
          <Log
            :key="`log-${index}`"
            :content="item.content"
            :level="item.level"
            :faded="item.faded"
          />
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </TitledLayout>
</template>

<style lang="scss">
.scroller {
  height: 100%;
  overflow-y: auto;
}
</style>
