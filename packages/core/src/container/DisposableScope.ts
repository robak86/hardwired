import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { IContainer, InstanceCreationAware, UseFn } from './IContainer.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { DisposeFn } from '../configuration/abstract/ContainerConfigurable.js';

export interface DisposableScope extends UseFn<LifeTime> {}

export class DisposableScope extends ExtensibleFunction implements InstanceCreationAware, Disposable {
  use: InstanceCreationAware['use'];
  all: InstanceCreationAware['all'];
  defer: InstanceCreationAware['defer'];

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

    this.use = this._container.use;
    this.all = this._container.all;
    this.defer = this._container.defer;
  }

  [Symbol.dispose](): void {
    for (const disposeFn of this._disposeFns) {
      console.log('diposee');
      disposeFn(this);
    }
  }
}
