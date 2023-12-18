/** Prefixed used for any plugin-related socket messages. */
export const PLUGIN_MESSAGE_PREFIX = 'vpes';

/** Returns a plugin-related prefixed message name. */
export const wsMessageName = (name: string) => `${PLUGIN_MESSAGE_PREFIX}:${name}`;
