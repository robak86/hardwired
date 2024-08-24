import { LifeTime } from './LifeTime.js';
import { FnServiceLocator } from '../../container/IContainer.js';
import { v4 } from 'uuid';
import { container } from '../../container/Container.js';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition.js';
import { AnyInstanceDefinition } from './AnyInstanceDefinition.js';

export type BaseFnDefinition<T, TLifeTime extends LifeTime, TMeta> = {
  readonly id: string;
  readonly strategy: TLifeTime;
  readonly create: (context: FnServiceLocator) => T;
  readonly meta?: TMeta;
};

export type FnDefinition<T, TLifeTime extends LifeTime, TMeta> = BaseDefinition<T, TLifeTime> & {
  (): T;
};

export function isFnBasedDefinition<T, TLifeTime extends LifeTime, TMeta>(
  def: AnyInstanceDefinition<T, TLifeTime, TMeta>,
): def is FnDefinition<T, TLifeTime, TMeta> {
  return Object.prototype.hasOwnProperty.call(def, 'kind');
}

export class BaseDefinition<TInstance, TLifeTime extends LifeTime> {
  readonly kind = 'fn' as const;
  readonly dependencies: any[] = []; // TODO: only for compatibility reason. Remove after opting out from builder based api

  constructor(
    public readonly id: string,
    public readonly strategy: TLifeTime,
    public readonly create: (context: FnServiceLocator) => TInstance,
  ) {}

  bounded() {
    return Object.assign(this, (): TInstance => {
      const cnt = container();
      return cnt.call(this);
    });
  }

  patch(): PatchDefinition<TInstance, TLifeTime> {
    return new PatchDefinition(this.id, this.strategy, this.create);
  }

  // TODO: return richer type, that will be only accepted as overrides
  // and split this like def.patch().replace();
  patchReplace<TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: FnDefinition<TExtendedInstance, TLifeTime, any>,
  ): FnDefinition<TExtendedInstance, TLifeTime, any> {
    return new BaseDefinition(this.id, def.strategy, def.create).bounded();
  }

  defineDecorated<TExtendedInstance extends TInstance>(
    decorateFn: (instance: TInstance) => TExtendedInstance,
  ): FnDefinition<TExtendedInstance, TLifeTime, any> {
    return new BaseDefinition(v4(), this.strategy, (use: FnServiceLocator): TExtendedInstance => {
      const instance = use(this);
      return decorateFn(instance);
    }).bounded();
  }

  defineApply(applyFn: (instance: TInstance) => void): FnDefinition<TInstance, TLifeTime, any> {
    return new BaseDefinition(v4(), this.strategy, (use: FnServiceLocator) => {
      const instance = use(this);
      applyFn(instance);

      return instance;
    }).bounded();
  }
}

export type AsyncFnDefinitionsArray<T extends FnDefinition<any, any, any>[]> = {
  [K in keyof T]: T[K] extends FnDefinition<infer TInstance, any, any>
    ? AsyncInstanceDefinition<TInstance, any, any>
    : never;
};

export class PatchDefinition<TInstance, TLifeTime extends LifeTime> extends BaseDefinition<TInstance, TLifeTime> {
  replace<TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: FnDefinition<TExtendedInstance, TLifeTime, any>,
  ): FnDefinition<TExtendedInstance, TLifeTime, any> {
    return new BaseDefinition(this.id, def.strategy, def.create).bounded();
  }

  set(newValue: TInstance): FnDefinition<TInstance, TLifeTime, any> {
    return new BaseDefinition(this.id, this.strategy, () => newValue).bounded();
  }
}

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance>(
    create: (locator: FnServiceLocator) => TInstance,
    id?: string,
  ): FnDefinition<TInstance, TLifeTime, never> => {
    return new BaseDefinition(id ?? v4(), lifeTime, create).bounded();
  };
