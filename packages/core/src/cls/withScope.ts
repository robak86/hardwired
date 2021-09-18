import { containerKey } from './useContainer';
import { ChildScopeOptions, Container, container } from '../container/Container';

export const withScope = <T>(options: ChildScopeOptions, runFn: () => T): T => {
  const currentContainer = Zone.current.get(containerKey);
  const cnt: Container = currentContainer ?? container();
  const parentZone = Zone.current;
  const forkedZone = parentZone.fork({
    name: `${parentZone} -> ${Math.random()}`,
    properties: { [containerKey]: cnt.checkoutScope(options) },
  }); // TODO: use reasonable names
  return forkedZone.run(runFn);
};
