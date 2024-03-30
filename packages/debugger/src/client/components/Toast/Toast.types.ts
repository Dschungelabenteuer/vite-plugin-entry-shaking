import type { useToaster } from './useToaster';

/** Available Toast types. */
export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'loading';

export type ToastProps = {
  /** Toast type. */
  type?: ToastType;
};

export type ToastSlots = {
  /** Toast content. */
  default(): any;
};

export type ToastOptions = {
  /** Should the toast be autoclosed after some delay. */
  autoclose?: boolean;
  /** If autoclosing, determines the toast duration (in ms). */
  duration?: number;
};

export type ToastData = {
  /** Toast type. */
  type?: ToastType;
  /** Toast message. */
  message: string;
};

export type Toast = {
  /** Toast autoincremented id. */
  idx: number;
  /** Toast type. */
  type?: ToastType;
  /** Toast message. */
  message: string;
  /** Dismiss function. */
  dismiss: () => void;
};

/** Toaster API. */
export type Toaster = ReturnType<typeof useToaster>;
