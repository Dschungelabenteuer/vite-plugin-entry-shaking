export type Parallel = <T extends any[]>(items: T, cb: ParallelCb<T>) => Promise<any[] | void>;
export type ParallelCb<T> = (
  item: T extends (infer A)[] ? A : never,
  index: number,
  array: any[],
) => Promise<any>;

export const parallelize: Parallel = async (a, cb) => Promise.all(a.map(cb));
export default { parallelize };
