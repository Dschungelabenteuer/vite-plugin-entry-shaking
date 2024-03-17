export type ValueOf<T> = T[keyof T];

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  ValueOf<{ [K in keyof T]: (evt: K, ...args: T[K]) => void }>
>;

/** Stringified boolean type. */
export type Booleanish = 'true' | 'false';

declare global {
  interface ViewTransition {
    finished: Promise<void>;
    updateCallbackDone: Promise<void>;
    ready: Promise<void>;
  }

  interface Document {
    startViewTransition?: (callback: () => Promise<void> | void) => ViewTransition;
  }

  interface CSSStyleDeclaration {
    viewTransitionName: string;
  }
}
