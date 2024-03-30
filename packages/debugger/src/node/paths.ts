import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { normalizePath } from 'vite';
import type { ConsumerPackageInfo } from '../types';

const CURR_DIR = dirname(fileURLToPath(import.meta.url));

/** Path to debugger's built client application. */
export const PATH_TO_CLIENT = resolve(CURR_DIR, '../dist/client');

/** Path to active process' `package.json` file. */
export const PATH_TO_CONSUMER_PACKAGE = normalizePath(resolve(process.cwd(), 'package.json'));

/** Retrieves consumer package's info. */
export async function getConsumerPackageInfo(): Promise<ConsumerPackageInfo> {
  try {
    const packageJsonContent = await readFile(PATH_TO_CONSUMER_PACKAGE, 'utf-8');
    const { name, version } = JSON.parse(packageJsonContent);
    return { name, version };
  } catch (error) {
    return { name: 'Debugger' };
  }
}
