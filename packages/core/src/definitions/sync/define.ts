import { instanceDefinition, InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { v4 } from 'uuid';
import { IContainerScopes, ISyncContainer } from '../../container/IContainer.js';
import { Container } from '../../container/Container.js';

export const define = <TLifeTime extends LifeTime>(lifetime: TLifeTime) => {
  return <TValue>(
    buildFn: (locator: ISyncContainer<TLifeTime> & IContainerScopes<TLifeTime>) => TValue,
  ): InstanceDefinition<TValue, TLifeTime> => {
    return instanceDefinition({
      id: v4(),
      strategy: lifetime,
      create: (context: ContainerContext) => {
        return buildFn(new Container(context));
      },
    });
  };
};
