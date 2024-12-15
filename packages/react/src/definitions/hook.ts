import { Definition, LifeTime } from 'hardwired';
import { initializedHooksD } from './initializedHooks.js';

export class HookDefinition<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> extends Definition<
  TInstance,
  TLifeTime,
  TArgs
> {
  readonly __kind = 'hook' as const;
}

export const hook = <TReturn>(hookFn: () => TReturn): HookDefinition<TReturn, LifeTime.singleton, any> => {
  const definitionId = Symbol();

  return new HookDefinition<TReturn, LifeTime.singleton, any>(definitionId, LifeTime.singleton, _use => {
    const initializedHooks = _use(initializedHooksD);

    if (!initializedHooks.isInitialized(definitionId)) {
      throw new Error(
        `Hook ${hookFn.name} is not initialized.
         To use the hook value you need to pass it to the <ContainerProvider hooks={[hookDefinition]}>.
         The hooks list cannot change after the first render.
         `,
      );
    }

    return hookFn();
  });
};
