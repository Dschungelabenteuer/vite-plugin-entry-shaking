import type { Meta, StoryObj } from '@storybook/vue3';

import { ref } from 'vue';
import Button from '@components/Button/Button.vue';
import Dialog from './Dialog.vue';

import { paddingDecorator } from '$storybook/decorators';

const meta = {
  component: Dialog,
  title: 'Components/Dialog',
  tags: ['autodocs'],
  decorators: [paddingDecorator],
  render: (args) => ({
    components: { Dialog, Button },
    setup() {
      const dialogRef = ref<InstanceType<typeof Dialog> | null>(null);
      const open = () => dialogRef.value?.element?.showModal();
      return { args, open, dialogRef };
    },
    template: `
    <Button label="Open modal" @click="open" class="bordered" />
    <Dialog ref="dialogRef" v-bind="args">
      Dialog content
    </Dialog>
    `,
  }),
} satisfies Meta<typeof Dialog>;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    title: 'Dialog title',
    width: '400px',
    height: '200px',
  },
};

export default meta;
