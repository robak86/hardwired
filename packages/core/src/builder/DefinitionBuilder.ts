import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ClassType } from '../utils/ClassType.js';
import { assertValidDependency } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { IContainerScopes, InstanceCreationAware } from '../container/IContainer.js';
import { ContainerContext } from '../context/ContainerContext.js';
import { Container } from '../container/Container.js';

export class DefinitionBuilder<TDeps extends InstanceDefinition<any, any>[], TLifeTime extends LifeTime> {
  constructor(
    private _deps: TDeps,
    private _lifeTime: TLifeTime,
  ) {}

  private _assertValidDependency() {
    assertValidDependency(this._lifeTime, this._deps);
  }

  define<TValue>(buildFn: (locator: InstanceCreationAware<TLifeTime> & IContainerScopes<TLifeTime>) => TValue) {
    return InstanceDefinition.create(this._lifeTime, (context: ContainerContext) => {
      return buildFn(new Container(context)); // TODO: still unclear if we should create a new instance of Container
    });
  }

  class<TInstance>(cls: ClassType<TInstance, InstancesArray<TDeps>>) {
    this._assertValidDependency();

    return InstanceDefinition.create(
      this._lifeTime,
      context => new cls(...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>)),
    );
  }

  fn<TValue>(factory: (...args: InstancesArray<TDeps>) => TValue) {
    this._assertValidDependency();

    return InstanceDefinition.create(this._lifeTime, context => {
      return factory(...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>));
    });
  }

  partial<TRestParams extends any[], TRet>(
    fn: (...args: [...InstancesArray<TDeps>, ...TRestParams]) => TRet,
  ): InstanceDefinition<(...args: TRestParams) => TRet, TLifeTime> {
    this._assertValidDependency();

    return InstanceDefinition.create(this._lifeTime, context =>
      fn.bind(null, ...(this._deps.map(context.buildWithStrategy) as InstancesArray<TDeps>)),
    );
  }
}

export function using<TLifeTime extends LifeTime>(strategy: TLifeTime) {
  return <TDeps extends InstanceDefinition<any, any>[]>(...deps: TDeps): DefinitionBuilder<TDeps, TLifeTime> => {
    return new DefinitionBuilder<TDeps, TLifeTime>(deps, strategy);
  };
}
