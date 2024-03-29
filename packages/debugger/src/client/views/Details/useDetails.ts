import { computed } from 'vue';
import type { Toaster } from '@components/Toast/Toast.types';
import type { DetailsProps } from './Details.types';

export function useDetails(props: DetailsProps, $toaster: Toaster) {
  const pathInputId = computed(() => `${props.id}-input`);
  const tabsContainerId = computed(() => `${props.id}-tabs`);
  const copyAbsolutePath = () => {
    navigator.clipboard.writeText(props.absolutePath);
    $toaster.add({
      type: 'success',
      message: 'Copied absolute path to clipboard!',
    });
  };

  const copyRelativePath = () => {
    navigator.clipboard.writeText(props.relativePath);
    $toaster.add({
      type: 'success',
      message: 'Copied relative path to clipboard!',
    });
  };

  return {
    pathInputId,
    tabsContainerId,
    copyAbsolutePath,
    copyRelativePath,
  };
}
