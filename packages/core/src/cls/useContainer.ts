import invariant from 'tiny-invariant';
import 'zone.js';

export const containerKey = '___container';

declare const __awaiter;

invariant(typeof __awaiter !== undefined, `useContainer cannot be used in build target above es5`);

export const useContainer = () => {
  const cnt = Zone.current.get(containerKey);
  invariant(cnt, `Container is missing in current execution context`);
  return cnt;
};
