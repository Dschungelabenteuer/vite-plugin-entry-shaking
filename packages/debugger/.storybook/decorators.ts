import { provide, ref } from 'vue';

export const paddingDecorator = () => ({ template: '<div style="padding: 2em;"><story/></div>' });
export const containedDecorator = (maxHeight?: string) => () => {
  const styles = [
    `max-height: ${maxHeight}`,
    'box-shadow: 0 0 0 1px var(--overall-border-color)',
    'background: var(--overall-background-color)',
  ].join(';');

  return {
    template: `<div style="${styles}"><story/></div>`,
  };
};

export const metricsDecorator = () => ({
  setup() {
    provide('metricsPanel', {
      closeBtnId: 'metrics-panel-close-btn-id',
      openBtnId: 'metrics-panel-open-btn-id',
      isOpen: ref(false),
      toggle: () => {},
    });
  },
  template: '<div><story /><router-view /></div>',
});
