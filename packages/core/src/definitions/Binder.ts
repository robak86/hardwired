import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './abstract/Definition.js';
import { IContainer } from '../container/IContainer.js';
import { ConfigurationContainer } from '../configuration/ContainerConfiguration.js';

export class Binder<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> {
  constructor(
    private _definition: Definition<TInstance, TLifeTime, TArgs>,
    private _definitions: Definition<any, any, any>[],
    private _parentContainer: ConfigurationContainer | null,
  ) {}

  to(newDefinition: Definition<TInstance, TLifeTime, TArgs>) {
    const definition = new Definition(this._definition.id, newDefinition.strategy, newDefinition.create);
    this._definitions.push(definition);
  }

  toValue(value: TInstance) {
    const newDefinition = new Definition(this._definition.id, this._definition.strategy, (use, ...args) => value);
    this._definitions.push(newDefinition);
  }

  toConfigured(configureFn: (locator: IContainer<TLifeTime>, instance: TInstance, ...args: TArgs) => void): void {
    const newDefinition = new Definition(
      this._definition.id,
      this._definition.strategy,
      (use: IContainer, ...args: TArgs) => {
        const instance = this._definition.create(use, ...args);
        configureFn(use, instance, ...args);
        return instance;
      },
    );

    this._definitions.push(newDefinition);
  }

  toDecorated<TExtendedInstance extends TInstance>(
    decorateFn: (use: IContainer<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): void {
    const newDefinition = new Definition(
      this._definition.id,
      this._definition.strategy,
      (use: IContainer, ...args: TArgs): TInstance => {
        const instance = this._definition.create(use, ...args);
        return decorateFn(use, instance, ...args);
      },
    );

    this._definitions.push(newDefinition);
  }

  toRedefined(create: (locator: IContainer<TLifeTime>, ...args: TArgs) => TInstance): void {
    const newDefinition = new Definition(this._definition.id, this._definition.strategy, create);
    this._definitions.push(newDefinition);
  }

  // TODO: this doesn't make sens if the definition is singleton. No need to inherit as singletons are always global
  toInherited() {
    const newDefinition = new Definition(this._definition.id, LifeTime.transient, (_, ...args: TArgs) => {
      return this._parentContainer!.use(this._definition, ...args);
    });
    this._definitions.push(newDefinition);
  }
}
