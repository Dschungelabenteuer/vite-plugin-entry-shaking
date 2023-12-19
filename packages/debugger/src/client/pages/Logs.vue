<script setup lang="ts">
import { computed, ref } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import BrowserLayout from '../layouts/BrowserLayout.vue';
import Log from '../components/Log.vue';
import { store } from '../store';

const logs = computed(() => store.logs?.map((log, index) => ({ ...log, id: index, index })));
const scrollerClass = 'scroller';
const scrollerRef = ref<HTMLElement>();
const onResize = () => {
  const scrollerEl = scrollerRef.value?.querySelector(`.${scrollerClass}`);
  const scrollerWrapper = scrollerRef.value?.querySelector(`.vue-recycle-scroller__item-wrapper`);
  if (logs.value.length && scrollerEl && scrollerWrapper) {
    (scrollerWrapper as HTMLElement).style.minWidth = `${scrollerEl.scrollWidth}px`;
  }
};
</script>

<template>
  <BrowserLayout
    name="Logs"
    page-icon="tabler:clipboard-text"
  >
    <div
      ref="scrollerRef"
      class="scroller__wrapper"
    >
      <DynamicScroller
        :items="logs"
        :min-item-size="48"
        :emit-update="true"
        :class="scrollerClass"
        @resize="onResize"
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
    </div>
  </BrowserLayout>
</template>

<style lang="scss">
.scroller {
  height: 100%;
  overflow: auto;

  &__wrapper {
    height: 100%;
  }

  .vue-recycle-scroller {
    &__item-wrapper {
      overflow: visible;
    }
  }
}
</style>
