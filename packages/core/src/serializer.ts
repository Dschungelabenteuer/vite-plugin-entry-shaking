export const JSONMap = {
  stringify: (v: any) => JSON.stringify(v, replacer),
  parse: (v: string) => JSON.parse(v, reviver),
};

const TYPE = 't';
const MAP = 'm';
const VAL = 'v';

const isObject = (v: any) => typeof v === 'object' && v !== null;
const replacer = (_: any, v: any) => (v instanceof Map ? { [TYPE]: MAP, [VAL]: [...v] } : v);
const reviver = (_: any, v: any) => (isObject(v) && v[TYPE] === MAP ? new Map(v[VAL]) : v);
