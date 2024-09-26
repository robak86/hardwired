import { LifeTime } from './LifeTime.js';
import { IServiceLocator } from '../../container/IContainer.js';

export class BaseDefinition<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> {
  constructor(
    public readonly id: string,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IServiceLocator, ...args: TArgs) => TInstance,
  ) {}

  configure(
    configureFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
  ): BaseDefinition<TInstance, TLifeTime, TArgs> {
    return new BaseDefinition(this.id, this.strategy, (use: IServiceLocator, ...args: TArgs) => {
      const instance = this.create(use, ...args);
      configureFn(use, instance, ...args);
      return instance;
    });
  }

  decorateWith<TExtendedInstance extends TInstance>(
    decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): BaseDefinition<TInstance, TLifeTime, TArgs> {
    return new BaseDefinition(this.id, this.strategy, (use: IServiceLocator, ...args: TArgs): TInstance => {
      const instance = this.create(use, ...args);
      return decorateFn(use, instance, ...args);
    });
  }

  bindTo(definition: BaseDefinition<TInstance, TLifeTime, TArgs>): BaseDefinition<TInstance, TLifeTime, TArgs> {
    return new BaseDefinition(this.id, definition.strategy, definition.create);
  }

  bindValue(value: TInstance): BaseDefinition<TInstance, TLifeTime, TArgs> {
    return new BaseDefinition(this.id, this.strategy, (use, ...args) => value);
  }

  redefine(
    newCreate: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
  ): BaseDefinition<TInstance, TLifeTime, TArgs> {
    return new BaseDefinition(this.id, this.strategy, newCreate);
  }
}
