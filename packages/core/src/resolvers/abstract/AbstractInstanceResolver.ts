import { ContainerContext } from '../../container/ContainerContext';

export abstract class AbstractInstanceResolver<TValue, TDeps extends any[]> {
  abstract build(containerCtx: ContainerContext, dependencies: TDeps): TValue;
}
