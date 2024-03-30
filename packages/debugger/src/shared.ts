/** Prefixed used for any plugin-related socket messages. */
export const PLUGIN_MESSAGE_PREFIX = 'vpes';

/** Returns a plugin-related prefixed message name. */
export const wsMessageName = (name: string) => `${PLUGIN_MESSAGE_PREFIX}:${name}`;

/** Event name when the client is ready. */
export const READY = wsMessageName('getInitialState');

/** Socket message name when Vite dev server is disconnected. */
export const VITE_DISCONNECTED = 'vite:ws:disconnect';

/** Socket message name when Vite dev server is reconnecting. */
export const VITE_CONNECTING = 'vite:ws:connect';
