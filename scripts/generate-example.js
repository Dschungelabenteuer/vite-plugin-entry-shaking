import { cp, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import ora from 'ora';
import { promisify } from 'util';
import { exec } from 'child_process';
const run = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __template = '_template_';
const pathToExamples = resolve(__dirname, '../examples');
const pathToTemplate = resolve(pathToExamples, __template);

/** @type prompts.PromptObject */
const namePrompt = {
  type: 'text',
  name: 'name',
  message: 'Type in your example name',
  validate: (v) => {
    if (v.trim().length === 0) return "Name can't be empty";
    if (existsSync(resolve(pathToExamples, v))) return `Example "${v}" already exists`;
    return true;
  },
};

/** @type prompts.PromptObject */
const installPrompt = {
  type: 'confirm',
  name: 'install',
  initial: true,
  message: 'Install dependencies?',
};

(async () => {
  const { name } = await prompts(namePrompt);

  if (['syntaxes', '_template_'].includes(name)) {
    console.log(`❌ Name ${name} is reserved`);
    process.exit();
  }

  if (!name) {
    console.log('❌ Example generation aborted');
    process.exit();
  }

  // Copy template.
  const spinner = ora('Copying template…').start();
  await cp(pathToTemplate, resolve(pathToExamples, name), {
    recursive: true,
    filter: (source) => {
      return !source.includes('node_modules');
    },
  });

  // Prepare `package.json`.
  spinner.text = 'Preparing example';
  await preparePackageJson(name);
  spinner.succeed('Example created!');

  const { install } = await prompts(installPrompt);
  if (install) {
    spinner.start('Installing dependencies…');
    await run('pnpm i --ignore-scripts');
    spinner.succeed('Dependencies installed!');
  }
})();

async function preparePackageJson(name) {
  const packageJsonPath = resolve(pathToExamples, name, 'package.json');
  const templatePackageJson = await readFile(packageJsonPath, 'utf-8');
  await writeFile(packageJsonPath, templatePackageJson.replace('template', name));
}
