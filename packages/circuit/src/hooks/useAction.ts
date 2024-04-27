import { ActionArgumentsType, AnyActionDefinition } from '../builder/ActionBuilder.js';
import { useDefinition } from 'hardwired-react';

export const useAction = <TActionDefinition extends AnyActionDefinition>(
  action: TActionDefinition,
  ...args: ActionArgumentsType<TActionDefinition>
): (() => void) => {
  const def = useDefinition(action);

  // TODO: should memoize?
  return () => def(...args);
};
