import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ViteDevServer } from 'vite';
import sirv from 'sirv';
import colors from 'picocolors';

import type { Context } from 'vite-plugin-entry-shaking';
import type { ConsumerPackageInfo } from '../types';
import { PLUGIN_NAME, VERSION } from '../constants';
import { createChannel } from './channel';
import { getConsumerPackageInfo } from './paths';

const PATH_TO_CLIENT = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/client');

/**
 * Attaches a debugger to a Vite dev server instance.
 * @param server Vite dev server instance.
 * @param ctx Plugin context.
 */
export async function attachDebugger(server: ViteDevServer, ctx: Context) {
  const { base } = server.config;
  const debuggerPath = `${base}__debugger`;
  const sirvConfig = { dev: true, single: true };

  server.middlewares.use(debuggerPath, sirv(PATH_TO_CLIENT, sirvConfig));

  const consumer = await getConsumerPackageInfo();
  createChannel(server, ctx, consumer);
  printUrls(server, debuggerPath, consumer);
}

/**
 * Hijacks Vite's printUrls method to append debugger's URL.
 * @param server Vite dev server instance.
 * @param debuggerRoute Route to plugin's debugger client.
 * @param consumer Information about the consuming package.
 */
function printUrls(server: ViteDevServer, debuggerRoute: string, consumer: ConsumerPackageInfo) {
  const printViteUrls = server.printUrls;

  server.printUrls = () => {
    printViteUrls();
    const resolvedLocalUrls = server.resolvedUrls?.local ?? [];
    const pluginHeader = colors.green(`${colors.bold(PLUGIN_NAME)} v${VERSION}`);
    const pluginName = colors.dim('debugger');
    server.config.logger.info(`\n  ${pluginHeader} ${pluginName}\n`);

    resolvedLocalUrls.forEach((url, i) => {
      const baseUrl = url.endsWith('/') && debuggerRoute.startsWith('/') ? url.slice(0, -1) : url;
      const debugPath = debuggerRoute.endsWith('/') ? debuggerRoute : `${debuggerRoute}/`;
      const debugUrl = `${baseUrl}${debugPath}`;
      if (!i) {
        openBrowser(baseUrl);
        openBrowser(debugUrl, 300);
      }

      server.config.logger.info(
        colors.dim(colors.green('  ➜')) +
          colors.dim(`  ${colors.bold('Local:')} ${colors.cyan(debugUrl)}`),
      );

      if (consumer.name && consumer.version) {
        const debuggee = `${consumer.name}@${consumer.version}`;
        server.config.logger.info(
          colors.dim(colors.green('  ➜')) + colors.dim(`  Debugging ${colors.bold(debuggee)}`),
        );
      }
    });
  };
}
/**
 * Opens a browser window with the given address.
 * @param address Target address to open.
 * @param delay Delay before opening the browser.
 */
async function openBrowser(address: string, delay = 0) {
  setTimeout(async () => {
    await import('open')
      .then((r) => r.default(address, { newInstance: true }))
      .catch(() => {
        // Silent error, debugger should still be accessible from printed url.
      });
  }, delay);
}

export default attachDebugger;
