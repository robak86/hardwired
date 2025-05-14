import type { ClassType } from '../cls.js';
import { type Thunk, unwrapThunk } from '../../utils/Thunk.js';
import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import { isThenable } from '../../utils/IsThenable.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import type { InstancesDefinitions } from '../abstract/InstanceDefinition.js';
import type { AnyDefinition, IDefinition } from '../abstract/IDefinition.js';

import { Definition } from './Definition.js';

export class ClassDefinition<TInstance, TLifeTime extends LifeTime, TConstructorArgs extends unknown[]>
  implements IDefinition<TInstance, TLifeTime, []>
{
  private _hasOnlySyncDependencies = false; // flag for optimization, so we don't have to check every time

  readonly $type!: Awaited<TInstance>;
  readonly $p0!: never;
  readonly $p1!: never;
  readonly $p2!: never;
  readonly $p3!: never;
  readonly $p4!: never;
  readonly $p5!: never;

  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    protected readonly _class: ClassType<TInstance, TConstructorArgs>,
    protected readonly _dependencies?: Thunk<InstancesDefinitions<TConstructorArgs, TLifeTime>>,
  ) {
    if (Array.isArray(_dependencies)) {
      this.assertValidDependencies(_dependencies);
    }
  }

  override(createFn: (context: IContainer) => TInstance): Definition<TInstance, TLifeTime, []> {
    return new Definition(this.id, this.strategy, createFn);
  }

  bind(container: IContainer & IStrategyAware): Definition<TInstance, TLifeTime, []> {
    return this.override(_use => {
      return container.buildWithStrategy(this);
    });
  }

  create(use: IContainer): TInstance {
    // no dependencies
    if (this._dependencies === undefined) {
      // @ts-ignore
      return new this._class();
    }

    const deps = use.all(...unwrapThunk(this._dependencies)) as TConstructorArgs | Promise<TConstructorArgs>;

    if (this._hasOnlySyncDependencies) {
      return new this._class(...(deps as TConstructorArgs));
    }

    if (isThenable(deps)) {
      return deps.then(deps => {
        return new this._class(...deps);
      }) as TInstance;
    } else {
      this._hasOnlySyncDependencies = true;

      return new this._class(...deps);
    }
  }

  get name() {
    return this._class.name;
  }

  private assertValidDependencies(dependencies: AnyDefinition[]) {
    if (dependencies.some(dep => dep === undefined)) {
      throw new Error(
        `Some dependencies are undefined. Perhaps your modules have some circular dependencies.
         Try wrapping all dependencies in a function, e.g.:
         cls(this, () => [dependency1, dependency2])`,
      );
    }
  }
}
