export type StatusProps = {
  /** Status */
  status: 'ok' | 'warning' | 'error' | 'loading';
  /** Status message. */
  message: string;
};
