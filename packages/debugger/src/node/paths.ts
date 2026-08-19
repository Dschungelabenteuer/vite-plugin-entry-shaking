import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { normalizePath } from 'vite';
import type { ConsumerPackageInfo } from '../types';

/** Path to active process' `package.json` file. */
const PATH_TO_CONSUMER_PACKAGE = normalizePath(resolve(process.cwd(), 'package.json'));

/** Retrieves consumer package's info. */
export async function getConsumerPackageInfo(): Promise<ConsumerPackageInfo> {
  try {
    const packageJsonContent = await readFile(PATH_TO_CONSUMER_PACKAGE, 'utf-8');
    const { name, version } = JSON.parse(packageJsonContent);
    return { name, version };
  } catch {
    return { name: 'Debugger' };
  }
}
