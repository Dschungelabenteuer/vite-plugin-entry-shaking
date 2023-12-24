const randomIntString = () => Math.random().toString(36);
const randomString = () => Date.now().toString(36) + randomIntString().substring(2, 5);
export const randomId = (prefix = ''): string => prefix + randomString().toUpperCase();
