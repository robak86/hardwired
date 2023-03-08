import { LifeTime } from '../abstract/LifeTime.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { IContainerScopes, ISyncContainer } from '../../container/IContainer.js';
import { Container } from '../../container/Container.js';

export const asyncDefine = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <TValue>(
    fn: (locator: ISyncContainer<TLifeTime> & IContainerScopes<TLifeTime>) => Promise<TValue>,
  ): AsyncInstanceDefinition<TValue, TLifeTime> => {
    return asyncDefinition({
      strategy,
      create: async (context: ContainerContext) => {
        return fn(new Container(context));
      },
    });
  };
};
