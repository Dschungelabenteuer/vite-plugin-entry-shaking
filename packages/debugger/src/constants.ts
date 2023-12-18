import { readFileSync } from 'node:fs';

const { version, name } = JSON.parse(
  readFileSync(new URL('../../core/package.json', import.meta.url)).toString(),
);

/** Version of the base plugin. */
export const VERSION = version as string;

/** Name of the base plugin. */
export const PLUGIN_NAME = name as string;
