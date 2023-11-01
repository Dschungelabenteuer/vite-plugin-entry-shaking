/*
 * > When using export { Foo as Bar } from "..."
 * Assuming this is a third module, because of the issue's title and
 * because the description then states:
 * > "and then re-exporting "Bar" from a target file"
 */
export { Foo as Bar } from './Foo';
