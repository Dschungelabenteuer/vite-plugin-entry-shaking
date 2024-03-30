import type { Ref } from 'vue';
import { computed, ref, watchEffect } from 'vue';
import { isComponentInstance } from '#utils';
import type { ButtonInstance } from '@components/Button/Button.types';
import { useMenu } from '@composables/useMenu';
import type { VerticalTab, VerticalTabsProps } from './VerticalTabs.types';

export function useVerticalTabs(
  props: VerticalTabsProps,
  tabs: Ref<(ButtonInstance | HTMLButtonElement | null)[]>,
) {
  const activeTabId = props.activeTabId
    ? Math.max(
        0,
        props.tabs.findIndex((tab) => tab.id === props.activeTabId),
      )
    : 0;
  const menuItems = ref<(HTMLButtonElement | null)[]>([]);
  const menu = useMenu('y', menuItems, activeTabId);
  const ids = useVerticalTabsIds(props);
  const tablistWidth = computed(() => (props.iconOnly ? 'auto' : props.width));

  const setActiveTab = async (index: number) => {
    menu.setNthItem(index);
  };

  watchEffect(() => {
    menuItems.value = tabs.value.map((item) =>
      isComponentInstance(item) ? item!.reference : item,
    );
  });
  return { ids, menu, tablistWidth, setActiveTab };
}

export function useVerticalTabsIds(props: VerticalTabsProps) {
  const prefix = computed(() => `tabs_${props.id}`);
  const getTabId = (tabId: VerticalTab['id']) => `${prefix.value}_${tabId}`;
  const getTabPanelId = (tabId: VerticalTab['id']) => `${getTabId(tabId)}_tab`;
  const getTabButtonId = (tabId: VerticalTab['id']) => `${getTabId(tabId)}_btn`;

  return {
    getTabId,
    getTabPanelId,
    getTabButtonId,
  };
}
