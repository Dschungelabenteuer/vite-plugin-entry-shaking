type T = any;
const TYPE = 't';
const MAP = 'm';
const VAL = 'v';
const stringify = (v: T) => JSON.stringify(v, replacer);
const parse = (v: string) => JSON.parse(v, reviver);
const isObject = (v: T) => typeof v === 'object' && v !== null;
const replacer = (_: T, v: T) => (v instanceof Map ? { [TYPE]: MAP, [VAL]: [...v] } : v);
const reviver = (_: T, v: T) => (isObject(v) && v[TYPE] === MAP ? new Map(v[VAL]) : v);

/** Serializer is used to extend `JSON.stringify` and `JSON.parse` to support ES maps. */
export const JSONMap = { stringify, parse };