import { LifeTime } from './LifeTime.js';

import { v4 } from 'uuid';
import { container } from '../../container/Container.js';
import { AnyInstanceDefinition } from './AnyInstanceDefinition.js';
import { Resolution } from './Resolution.js';
import { ExtensibleFunction } from '../../utils/ExtensibleFunction.js';
import { IServiceLocator } from '../../container/IContainer.js';

export function isBasedDefinition<T, TLifeTime extends LifeTime, TMeta>(
  def: AnyInstanceDefinition<T, TLifeTime, TMeta>,
): def is BaseDefinition<T, TLifeTime, TMeta, any> {
  return Object.prototype.hasOwnProperty.call(def, 'kind');
}

export interface BaseDefinition<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]>
  extends ExtensibleFunction {
  (): TInstance;
}

export class BaseDefinition<
  TInstance,
  TLifeTime extends LifeTime,
  TMeta,
  TArgs extends any[],
> extends ExtensibleFunction {
  readonly kind = 'fn'; // TODO: used as a marker for isBasedDefinition. Remove after opting out from builder based api
  readonly dependencies: any[] = []; // TODO: only for compatibility reason. Remove after opting out from builder based api
  readonly resolution = Resolution.sync; // TODO: only for compatibility reason.

  constructor(
    public readonly id: string,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IServiceLocator) => TInstance,
    public readonly meta?: TMeta,
  ) {
    super(() => {
      const cnt = container();
      return cnt.use(this);
    });
  }

  patch(): PatchDefinition<TInstance, TLifeTime, TMeta, TArgs> {
    return new PatchDefinition(this.id, this.strategy, this.create, this.meta);
  }

  define(): DefineBuilder<TInstance, TLifeTime, TMeta, TArgs> {
    return new DefineBuilder(this.id, this.strategy, this.create, this.meta);
  }
}

// TODO:
//  make PatchDefinition incompatible with BaseDefinition so it cannot be used as overrides.
//  overrides should accept some richer type than definition so one cannot accidentally override with a definition
export class PatchDefinition<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]> extends BaseDefinition<
  TInstance,
  TLifeTime,
  TMeta,
  TArgs
> {
  replace<TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BaseDefinition<TExtendedInstance, TLifeTime, any, TArgs>,
  ): BaseDefinition<TExtendedInstance, TLifeTime, any, TArgs> {
    return new BaseDefinition(this.id, def.strategy, def.create, this.meta);
  }

  apply(applyFn: (instance: TInstance) => void): BaseDefinition<TInstance, TLifeTime, any, TArgs> {
    return new BaseDefinition(
      this.id,
      this.strategy,
      (use: IServiceLocator) => {
        const instance = use(this);
        applyFn(instance);

        return instance;
      },
      this.meta,
    );
  }

  decorate<TExtendedInstance extends TInstance>(
    decorateFn: (instance: TInstance) => TExtendedInstance,
  ): BaseDefinition<TExtendedInstance, TLifeTime, any, TArgs> {
    return new BaseDefinition(
      this.id,
      this.strategy,
      (use: IServiceLocator): TExtendedInstance => {
        const instance = use(this);
        return decorateFn(instance);
      },
      this.meta,
    );
  }

  set(newValue: TInstance): BaseDefinition<TInstance, TLifeTime, any, TArgs> {
    return new BaseDefinition(this.id, this.strategy, () => newValue, this.meta);
  }
}

export class DefineBuilder<TInstance, TLifeTime extends LifeTime, TMeta, TArgs extends any[]> extends BaseDefinition<
  TInstance,
  TLifeTime,
  TMeta,
  TArgs
> {
  apply(applyFn: (instance: TInstance) => void): BaseDefinition<TInstance, TLifeTime, any, TArgs> {
    return new BaseDefinition(
      v4(),
      this.strategy,
      (use: IServiceLocator) => {
        const instance = use(this);
        applyFn(instance);

        return instance;
      },
      this.meta,
    );
  }

  decorate<TExtendedInstance extends TInstance>(
    decorateFn: (instance: TInstance) => TExtendedInstance,
  ): BaseDefinition<TExtendedInstance, TLifeTime, any, TArgs> {
    return new BaseDefinition(
      v4(),
      this.strategy,
      (use: IServiceLocator): TExtendedInstance => {
        const instance = use(this);
        return decorateFn(instance);
      },
      this.meta,
    );
  }
}

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance, TMeta>(
    create: (locator: IServiceLocator) => TInstance,
    meta?: TMeta,
  ): BaseDefinition<TInstance, TLifeTime, TMeta, any> => {
    return new BaseDefinition(v4(), lifeTime, create, meta);
  };
