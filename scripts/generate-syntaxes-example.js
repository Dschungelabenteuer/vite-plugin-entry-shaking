import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cp, mkdir, readdir, rm, readFile, writeFile } from 'fs/promises';
import { readFileSync, readdirSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToCore = resolve(__dirname, '../packages/core');
const pathToExamples = resolve(__dirname, '../examples');
const pathToSyntaxesExample = resolve(pathToExamples, 'syntaxes/src/data');
const pathToSyntaxesExampleModules = resolve(pathToSyntaxesExample, 'modules');
const pathToSyntaxesExampleSummary = resolve(pathToSyntaxesExample, 'summary.json');
const pathToEntriesSummary = resolve(pathToExamples, 'syntaxes', 'entries.json');
const pathToTests = resolve(pathToCore, 'tests');
const pathToMockModules = resolve(pathToTests, '__mocks__', 'modules');
const pathToTestCases = resolve(pathToTests, 'cases');

const rdir = (path) => readdir(path, { withFileTypes: true });
const _log = (v) => `console.log(${v});`;
const copyMockModules = async () => await cp(pathToMockModules, pathToSyntaxesExampleModules, { recursive: true });
const getCasesGroups = async () => (await rdir(pathToTestCases)).filter((a) => a.isDirectory());
const getGroupFiles = async (groupPath) => (await rdir(groupPath)).filter((f) => f.isFile());
const getExampleContent = (data) => [data.content, _log(data.print?.join(', '))].join('\n');
const getEntryContent = async (entryPath) =>
  (await readFile(entryPath, 'utf-8'))
    .replaceAll('@test-modules', '../../../modules')
    .replaceAll('@test-cases', '../..');


(async () => {
  await cleanupExample();
  await Promise.all([copyMockModules(), createCasesEntries()]);
  console.info('\x1b[32m✔ "Syntaxes" example created based on core package tests!\x1b[0m');
})();

async function cleanupExample() {
  await rm(pathToSyntaxesExample, { recursive: true }).catch((e) => { });
  await mkdir(pathToSyntaxesExample);
}

async function createCasesEntries() {
  const groups = await getCasesGroups();
  const entriesPaths = [];
  const summary = [];

  for (const group of groups) {
    const groupSummary = [];
    const targetGroupPath = resolve(pathToSyntaxesExample, 'cases', group.name);
    await mkdir(targetGroupPath, { recursive: true });
    await mkdir(resolve(targetGroupPath, 'entries'), { recursive: true });
    await mkdir(resolve(targetGroupPath, 'modules'), { recursive: true });
    const groupPath = resolve(group.path, group.name);
    const groupFiles = await getGroupFiles(groupPath);
    const { entries, examples } = parseGroupFiles(groupFiles);

    for (const entry of entries) {
      const targetEntryPath = resolve(targetGroupPath, 'entries', entry.name);
      const entryPath = resolve(entry.path, entry.name);
      const content = await getEntryContent(entryPath);
      await writeFile(targetEntryPath, content);
      entriesPaths.push(targetEntryPath);
    }

    for (const example of examples) {
      const { exampleName, exampleContent, exampleDescription } = example;
      const { requiresModules, requiresEntries } = example;
      const examplePath = resolve(targetGroupPath, `${exampleName}.ts`);
      await writeFile(examplePath, exampleContent);

      if (requiresEntries) {
        Object.entries(requiresEntries).forEach(([entryPath, entryContent]) => {
          const targetEntryPath = resolve(targetGroupPath, `${entryPath}.ts`);
          writeFileSync(targetEntryPath, entryContent);
          entriesPaths.push(targetEntryPath);
        });
      }

      if (requiresModules) {
        Object.entries(requiresModules).forEach(([modulePath, moduleContent]) => {
          const targetModulePath = resolve(targetGroupPath, `${modulePath}.ts`);
          writeFileSync(targetModulePath, moduleContent);
        });
      }

      groupSummary.push({ exampleName, exampleDescription, examplePath });
    }

    summary.push([group.name, groupSummary]);
  }

  await writeFile(pathToEntriesSummary, JSON.stringify(entriesPaths, null, 2));
  await writeFile(pathToSyntaxesExampleSummary, JSON.stringify(summary, null, 2));
}

function parseGroupFiles(files) {
  return files.reduce((out, file) => {
    if (file.name === 'setup.ts' || file.name.includes('test.ts')) return out;
    if (file.name === 'examples.json') {
      const exampleContent = readFileSync(resolve(file.path, file.name), 'utf-8');
      const exampleMap = Object.entries(JSON.parse(exampleContent).examples);
      out.examples = exampleMap.map(([exampleName, exampleData]) => ({
        exampleName,
        exampleContent: getExampleContent(exampleData),
        exampleDescription: exampleData.description.join(' '),
        requiresModules: exampleData.requiresModules,
        requiresEntries: exampleData.requiresEntries,
      }));
    } else {
      out.entries.push(file);
    }

    return out;
  }, { entries: [], examples: [] });
}


