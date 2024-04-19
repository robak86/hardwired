import { InstanceDefinition } from '../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../abstract/LifeTime.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { IContainerScopes, InstanceCreationAware } from '../../container/IContainer.js';
import { Container } from '../../container/Container.js';

export const define = <TLifeTime extends LifeTime>(lifetime: TLifeTime) => {
  return <TValue>(
    buildFn: (locator: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime>) => TValue,
  ): InstanceDefinition<TValue, TLifeTime> => {
    return InstanceDefinition.create(
      lifetime,
      (context: ContainerContext) => {
        return buildFn(new Container(context));
      },
      [],
    );
  };
};
