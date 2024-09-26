import { LifeTime } from './LifeTime.js';

import { v4 } from 'uuid';
import { IServiceLocator } from '../../container/IContainer.js';

export class BaseDefinition<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]> {
  constructor(
    public readonly id: string,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IServiceLocator, ...args: TArgs) => TInstance,
    public readonly meta: TMeta = undefined as TMeta,
  ) {}

  configure(
    configureFn: (locator: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => void,
  ): BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(
      this.id,
      this.strategy,
      (use: IServiceLocator, ...args: TArgs) => {
        const instance = this.create(use, ...args);
        configureFn(use, instance, ...args);
        return instance;
      },
      this.meta,
    );
  }

  decorateWith<TExtendedInstance extends TInstance>(
    decorateFn: (use: IServiceLocator<TLifeTime>, instance: TInstance, ...args: TArgs) => TExtendedInstance,
  ): BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(
      this.id,
      this.strategy,
      (use: IServiceLocator, ...args: TArgs): TInstance => {
        const instance = this.create(use, ...args);
        return decorateFn(use, instance, ...args);
      },
      this.meta,
    );
  }

  bindTo(
    definition: BaseDefinition<TInstance, TLifeTime, any, TArgs>,
  ): BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(this.id, definition.strategy, definition.create, definition.meta);
  }

  bindValue(value: TInstance): BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(this.id, this.strategy, (use, ...args) => value, this.meta);
  }

  redefine(
    newCreate: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
  ): BaseDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new BaseDefinition(this.id, this.strategy, newCreate, this.meta);
  }
}

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance, TMeta>(
    create: (locator: IServiceLocator<TLifeTime>) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, TLifeTime, TMeta, []> => {
    return new BaseDefinition(v4(), lifeTime, create, meta);
  };

export function transientFn<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]>(
  create: (locator: IServiceLocator<TLifeTime>, ...args: TArgs) => TInstance,
  meta?: TMeta,
): BaseDefinition<TInstance, LifeTime.transient, TMeta, TArgs> {
  return new BaseDefinition(v4(), LifeTime.transient, create, meta);
}
