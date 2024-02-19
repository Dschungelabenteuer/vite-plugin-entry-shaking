import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';

const require = createRequire(import.meta.url);
const packageMainPath = require.resolve('vite-plugin-entry-shaking');
const packageJsonPath = resolve(packageMainPath, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const { name, version } = packageJson;
export const VERSION = version as string;
export const PLUGIN_NAME = name as string;
