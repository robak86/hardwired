import { LifeTime } from './LifeTime.js';
import { IServiceLocator } from '../../container/IContainer.js';

export class Definition<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> {
  constructor(
    public readonly id: string,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IServiceLocator, ...args: TArgs) => TInstance,
  ) {}

  configure(
    configureFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
  ): Definition<TInstance, TLifeTime, TArgs> {
    return new Definition(this.id, this.strategy, (use: IServiceLocator, ...args: TArgs) => {
      const instance = this.create(use, ...args);
      configureFn(use, instance, ...args);
      return instance;
    });
  }

  decorateWith<TExtendedInstance extends TInstance>(
    decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): Definition<TInstance, TLifeTime, TArgs> {
    return new Definition(this.id, this.strategy, (use: IServiceLocator, ...args: TArgs): TInstance => {
      const instance = this.create(use, ...args);
      return decorateFn(use, instance, ...args);
    });
  }

  bindTo(definition: Definition<TInstance, TLifeTime, TArgs>): Definition<TInstance, TLifeTime, TArgs> {
    return new Definition(this.id, definition.strategy, definition.create);
  }

  bindValue(value: TInstance): Definition<TInstance, TLifeTime, TArgs> {
    return new Definition(this.id, this.strategy, (use, ...args) => value);
  }

  redefine(
    newCreate: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
  ): Definition<TInstance, TLifeTime, TArgs> {
    return new Definition(this.id, this.strategy, newCreate);
  }
}
