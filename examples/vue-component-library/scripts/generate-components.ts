import { writeFileSync, rmSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToLib = resolve(__dirname, '../src/lib');
const pathToLibEntry = resolve(pathToLib, 'index.ts');

/** @type prompts.PromptObject */
const countPrompt = {
  type: 'number' as const,
  name: 'count',
  message: 'How many components do you want?',
};

(async () => {
  const { count } = await prompts(countPrompt);

  const createSpinner = ora('Creating components…').start();
  const components = await createComponents(count);
  createSpinner.succeed('Components created!');

  const entrySpinner = ora('Updating entry file…').start();
  await updateEntryFile(components);
  entrySpinner.succeed('Entry file updated!');
})();

async function createComponents(count: number) {
  const components: string[] = [];
  rmSync(resolve(pathToLib, 'components'), { recursive: true });
  mkdirSync(resolve(pathToLib, 'components'));
  for (let i = 1; i <= count; i++) {
    const componentName = `Comp${i}`;
    components.push(componentName);
    const componentFilepath = resolve(pathToLib, 'components', `${componentName}.vue`);

    writeFileSync(
      componentFilepath,
      [
        '<script setup lang="ts">',
        `defineOptions({ name: '${componentName}' });`,
        '</script>',
        '',
        '<template>',
        `  <div>${componentName}</div>`,
        '</template>',
      ].join('\n')
    );
  }
  return components;
}

async function updateEntryFile(components: string[]) {
  writeFileSync(
    pathToLibEntry,
    [
      "export { Something } from './something';",
      ...components.map(
        (component) =>
          `import ${component} from './components/${component}.vue'; export { ${component} };`
      ),
    ].join('\n')
  );
}
