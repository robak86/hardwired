import { LifeTime } from '../abstract/LifeTime.js';
import { asyncDefinition, AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { IAsyncContainer, IContainerScopes, ISyncContainer } from '../../container/IContainer.js';
import { RequestContainer } from "../../container/RequestContainer.js";


export const asyncDefine = <TLifeTime extends LifeTime>(strategy: TLifeTime) => {
  return <TValue>(
    fn: (
      locator: ISyncContainer<TLifeTime> & IAsyncContainer<TLifeTime> & IContainerScopes<TLifeTime>,
    ) => Promise<TValue>,
  ): AsyncInstanceDefinition<TValue, TLifeTime> => {
    return asyncDefinition({
      strategy,
      create: async (context: ContainerContext) => {
        return fn(new RequestContainer(context));
      },
    });
  };
};
