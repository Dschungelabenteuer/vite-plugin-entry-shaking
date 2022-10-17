import { User } from './User';
import { Article } from './Article';
import { Category as ArticleCateogry } from './Category';
import Group from './Group';
import { Unused } from './Unused';

export { User };
export { Unused };
export { Aggregated } from './Aggregated';
export { Article, ArticleCateogry };
export const TestValue = 'value';
export const MyGroup = Group;
export function TestFunction() {
  return User;
}
