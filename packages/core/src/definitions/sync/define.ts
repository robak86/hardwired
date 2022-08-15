import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { v4 } from 'uuid';
import { RequestContainer } from '../../container/RequestContainer.js';
import { IContainerScopes, ISyncContainer } from '../../container/IContainer.js';

export const define = <TLifeTime extends LifeTime>(lifetime: TLifeTime) => {
  return <TValue>(
    buildFn: (locator: ISyncContainer<TLifeTime> & IContainerScopes<TLifeTime>) => TValue,
  ): InstanceDefinition<TValue, TLifeTime> => {
    return instanceDefinition({
      id: v4(),
      strategy: lifetime,
      create: (context: ContainerContext) => {
        return buildFn(new RequestContainer(context));
      },
    });
  };
};
