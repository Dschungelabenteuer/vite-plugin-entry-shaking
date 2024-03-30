export type ClassNameFn = (name?: string) => string;

/**
 * Simply returns a function that concats a base class name with another string.
 * @param baseClass Base class name.
 */
export function useClassNames(baseClass: string): ClassNameFn {
  /**
   * Concats the base class name with the provided `name` string,
   * or directly returns the base class name if name` is omitted.
   * @param name Name to be concatenated to base class name.
   */
  return (name?: string) => (name ? `${baseClass}__${name}` : baseClass);
}
