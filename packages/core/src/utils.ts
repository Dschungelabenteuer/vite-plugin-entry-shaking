export type Parallel = <T extends any[]>(items: T, cb: ParallelCb<T>) => Promise<any[] | void>;
export type ParallelCb<T> = (
  item: T extends (infer A)[] ? A : never,
  index: number,
  array: any[],
) => Promise<any>;

export const parallelize: Parallel = async (a, cb) => Promise.all(a.map(cb));
export const diagnostic = (message: string) => `[diagnostic] ${message}`;

export const loadEventBus = async () => await import('./event-bus');
export const loadDebugger = async () => {
  const debuggerPkgName = 'vite-plugin-entry-shaking-debugger';
  try {
    const debuggerPkg = await import(debuggerPkgName);
    return debuggerPkg;
  } catch {
    throw new Error(`Using the \`debug\` option requires installing \`${debuggerPkgName}\``);
  }
};

export default { parallelize };
