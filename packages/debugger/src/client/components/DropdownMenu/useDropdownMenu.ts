import type { Ref } from 'vue';
import { ref, toRef, watch, watchEffect } from 'vue';
import { isComponentInstance } from '#utils';
import type { ButtonInstance } from '@components/Button/Button.types';
import { useMenu } from '@composables/useMenu';
import type { DropdownMenuProps } from './DropdownMenu.types';

const NAVIGATION_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];

export function useDropdownMenu(
  props: DropdownMenuProps,
  emit: any,
  items: Ref<(ButtonInstance | HTMLButtonElement | null)[]>,
) {
  const isOpen = toRef(props, 'isOpen');
  const isTransitioning = toRef(props, 'isTransitioning');
  const menuItems = ref<(HTMLButtonElement | null)[]>([]);
  const menu = useMenu('y', menuItems);
  let originActiveItem = document.activeElement;

  const handleKeydown = (event: KeyboardEvent) => {
    if (!NAVIGATION_KEYS.includes(event.key)) return;
    if (event.key === 'Escape') return emit('close');
    return menu.handleKeydown(event);
  };

  watchEffect(() => {
    menuItems.value = items.value.map((item) =>
      isComponentInstance(item) ? item!.reference : item,
    );
  });

  // Autofocus first menu item when opening the dropdown.
  watch(isOpen, (isPopoverOpen) => {
    if (isPopoverOpen) {
      originActiveItem = document.activeElement;
      menuItems.value[0]?.classList.add('active');
      menu.setFirstItem();
    } else {
      (originActiveItem as HTMLElement).focus();
    }
  });

  // CSS Transitions prevent focus.
  watch(isTransitioning, (isPopoverTransitioning) => {
    if (!isPopoverTransitioning) {
      menuItems.value[0]?.classList.remove('active');
      menu.focusActiveItem();
    }
  });

  return { handleKeydown };
}
