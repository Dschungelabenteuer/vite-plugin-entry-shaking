import { Foo, determineBarState } from './util';

export function runFoo() {
  return Foo.determineFooState();
}

export function runBar() {
  return determineBarState();
}
