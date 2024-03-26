import { ref } from 'vue';
import ValuePreviewer from './ValuePreviewer.vue';

export function getModelRenderFunction(
  Component: any,
  defaultValue?: any,
  customTemplate?: string,
) {
  return (args: any) => ({
    components: { Component, ValuePreviewer },
    setup() {
      const model = ref(defaultValue);
      return { Component, args, model };
    },
    template: `${
      customTemplate || '<component :is="Component" v-bind="args" v-model="model" />'
    }<ValuePreviewer :value="model" />`,
  });
}
