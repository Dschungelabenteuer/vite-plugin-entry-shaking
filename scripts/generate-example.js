import { cp, readFile, unlink, writeFile } from 'fs/promises';
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

const installPrompt = {
  type: 'confirm',
  name: 'install',
  message: 'Install dependencies?',
};

(async () => {
  const { name } = await prompts(namePrompt);
  const prefix = `New "${name}" example`;
  const format = (s) => `${prefix} - ${s}`;
  // Copy template.
  const spinner = ora(format('Copying template…')).start();
  await cp(pathToTemplate, resolve(pathToExamples, name), { recursive: true });
  // Prepare `package.json`.
  spinner.text = format('Preparing example');
  await preparePackageJson(name);
  spinner.succeed(format('Example created!'));

  const { install } = await prompts(installPrompt);
  if (install) {
    spinner.start(format('Installing dependencies…'));
    await run('pnpm i --ignore-scripts');
    spinner.succeed(format('Dependencies installed!'));
  }
})();

async function preparePackageJson(name) {
  const packageJsonPath = resolve(pathToExamples, name, 'package.json');
  const templatePackageJsonPath = `${packageJsonPath}.example`;
  const templatePackageJson = await readFile(templatePackageJsonPath, 'utf-8');
  await writeFile(packageJsonPath, templatePackageJson.replace('#{name}', name));
  await unlink(templatePackageJsonPath);
}
