import 'zone.js';
import { container } from '../container/Container';
import { containerKey } from './useContainer';

export const withContainer = <T>(runFn: () => T): T => {
  const currentContainer = Zone.current.get(containerKey);
  const cnt = currentContainer ?? container();
  const parentZone = Zone.current;
  const forkedZone = parentZone.fork({
    name: `${parentZone} -> ${Math.random()}`,
    properties: { [containerKey]: cnt },
  }); // TODO: use reasonable names
  return forkedZone.run(runFn);
};
