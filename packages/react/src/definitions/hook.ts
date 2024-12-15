import { Definition, IContainer, LifeTime } from 'hardwired';
import { HookValues, hookValuesD } from './hookValues.js';

export class HookDefinition<TInstance, TLifeTime extends LifeTime> extends Definition<
  HookValue<TInstance>,
  TLifeTime,
  []
> {
  readonly __kind = 'hook' as const;

  constructor(
    definitionId: symbol,
    lifeTime: TLifeTime,
    public readonly hook: () => TInstance,
    factory: (container: IContainer) => HookValue<TInstance>,
  ) {
    super(definitionId, lifeTime, factory);
  }
}

type HookValue<TValue> = {
  use(): TValue;
};

export const hook = <TReturn>(hookFn: () => TReturn): HookDefinition<TReturn, LifeTime.singleton> => {
  const definitionId = Symbol();

  return new HookDefinition<TReturn, LifeTime.singleton>(definitionId, LifeTime.singleton, hookFn, _use => {
    const initializedHooks: HookValues = _use(hookValuesD);

    if (!initializedHooks.hasValue(definitionId)) {
      throw new Error(
        `Hook ${hookFn.name} is not initialized.
         To use the hook value you need to pass it to the <ContainerProvider hooks={[hookDefinition]}>.
         The hooks list cannot change after the first render.
         `,
      );
    }

    return {
      use(): TReturn {
        return initializedHooks.getHookValue(definitionId);
      },
    };
  });
};
