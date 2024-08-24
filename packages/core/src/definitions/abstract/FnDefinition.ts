import { LifeTime } from './LifeTime.js';
import { FnServiceLocator } from '../../container/IContainer.js';
import { v4 } from 'uuid';
import { container } from '../../container/Container.js';
import { AsyncInstanceDefinition } from './async/AsyncInstanceDefinition.js';
import { AnyInstanceDefinition } from './AnyInstanceDefinition.js';
import { Resolution } from './Resolution.js';

export type IDefinition<T, TLifeTime extends LifeTime, TMeta> = {
  readonly id: string;
  readonly strategy: TLifeTime;
  readonly create: (context: FnServiceLocator) => T;
  readonly meta?: TMeta;
};

export type BoundDefinition<T, TLifeTime extends LifeTime, TMeta> = BaseDefinition<T, TLifeTime, TMeta> & {
  (): T;
};

export function isBasedDefinition<T, TLifeTime extends LifeTime, TMeta>(
  def: AnyInstanceDefinition<T, TLifeTime, TMeta>,
): def is BaseDefinition<T, TLifeTime, TMeta> {
  return Object.prototype.hasOwnProperty.call(def, 'kind');
}

export class BaseDefinition<TInstance, TLifeTime extends LifeTime, TMeta> {
  readonly kind = 'fn'; // TODO: used as a marker for isBasedDefinition. Remove after opting out from builder based api
  readonly dependencies: any[] = []; // TODO: only for compatibility reason. Remove after opting out from builder based api
  readonly resolution = Resolution.sync; // TODO: only for compatibility reason.

  constructor(
    public readonly id: string,
    public readonly strategy: TLifeTime,
    public readonly create: (context: FnServiceLocator) => TInstance,
  ) {}

  bounded() {
    // TODO: this requires all methods to be properties holding fat arrow functions.
    return Object.assign((): TInstance => {
      const cnt = container();
      return cnt.use(this);
    }, this);
  }

  patch = (): PatchDefinition<TInstance, TLifeTime, TMeta> => new PatchDefinition(this.id, this.strategy, this.create);

  // TODO: return richer type, that will be only accepted as overrides
  // and split this like def.patch().replace();
  patchReplace = <TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BoundDefinition<TExtendedInstance, TLifeTime, any>,
  ): BoundDefinition<TExtendedInstance, TLifeTime, any> =>
    new BaseDefinition(this.id, def.strategy, def.create).bounded();

  defineDecorated = <TExtendedInstance extends TInstance>(
    decorateFn: (instance: TInstance) => TExtendedInstance,
  ): BoundDefinition<TExtendedInstance, TLifeTime, any> =>
    new BaseDefinition(v4(), this.strategy, (use: FnServiceLocator): TExtendedInstance => {
      const instance = use(this);
      return decorateFn(instance);
    }).bounded();

  defineApply = (applyFn: (instance: TInstance) => void): BoundDefinition<TInstance, TLifeTime, any> =>
    new BaseDefinition(v4(), this.strategy, (use: FnServiceLocator) => {
      const instance = use(this);
      applyFn(instance);

      return instance;
    }).bounded();
}

export type AsyncFnDefinitionsArray<T extends BoundDefinition<any, any, any>[]> = {
  [K in keyof T]: T[K] extends BoundDefinition<infer TInstance, any, any>
    ? AsyncInstanceDefinition<TInstance, any, any>
    : never;
};

export class PatchDefinition<TInstance, TLifeTime extends LifeTime, TMeta> extends BaseDefinition<
  TInstance,
  TLifeTime,
  TMeta
> {
  replace<TExtendedInstance extends TInstance, TLifeTime extends LifeTime>(
    def: BoundDefinition<TExtendedInstance, TLifeTime, any>,
  ): BaseDefinition<TExtendedInstance, TLifeTime, any> {
    return new BaseDefinition(this.id, def.strategy, def.create).bounded();
  }

  set(newValue: TInstance): BoundDefinition<TInstance, TLifeTime, any> {
    return new BaseDefinition(this.id, this.strategy, () => newValue).bounded();
  }
}

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance>(
    create: (locator: FnServiceLocator) => TInstance,
    id?: string,
  ): BoundDefinition<TInstance, TLifeTime, never> => {
    return new BaseDefinition(id ?? v4(), lifeTime, create).bounded();
  };
