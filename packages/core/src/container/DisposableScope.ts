import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { Definition } from '../definitions/abstract/Definition.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import type { DisposeFn } from '../configuration/abstract/ContainerConfigurable.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

import type {
  ContainerAllReturn,
  ContainerObjectReturn,
  IContainer,
  InstanceCreationAware,
  UseFn,
} from './IContainer.js';

export interface DisposableScope extends UseFn<LifeTime> {}

export interface IDisposableScope extends Disposable {
  dispose(): void;
}

export class DisposableScope extends ExtensibleFunction implements InstanceCreationAware, IDisposableScope {
  private _isDisposed = false;

  constructor(
    private _container: IContainer,
    private _disposeFns: DisposeFn[] = [],
  ) {
    super(
      <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
        definition: Definition<TInstance, TLifeTime, TArgs>,
        ...args: TArgs
      ) => {
        return this._container.use(definition, ...args);
      },
    );
  }

  get id() {
    return this._container.id;
  }

  dispose(): void {
    this[Symbol.dispose]();
  }

  [Symbol.dispose](): void {
    if (this._isDisposed) {
      throw new Error('The scope is already disposed.');
    }

    for (const disposeFn of this._disposeFns) {
      disposeFn(this);
    }

    this._isDisposed = true;
  }

  use<TValue, TArgs extends any[]>(
    instanceDefinition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    return this._container.use(instanceDefinition, ...args);
  }

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): ContainerAllReturn<TDefinitions> {
    return this._container.all(...definitions) as ContainerAllReturn<TDefinitions>;
  }

  defer<TInstance, TArgs extends any[]>(
    factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>,
  ): (...args: TArgs) => TInstance {
    return this._container.defer(factoryDefinition);
  }

  object<TRecord extends Record<PropertyKey, Definition<any, any, any>>>(
    object: TRecord,
  ): ContainerObjectReturn<TRecord> {
    return this._container.object(object) as ContainerObjectReturn<TRecord>;
  }
}
