import type { ClassType } from '../cls.js';
import { type Thunk, unwrapThunk } from '../../utils/Thunk.js';
import type { IContainer } from '../../container/IContainer.js';
import { isPromise } from '../../utils/IsPromise.js';

import type { LifeTime } from './LifeTime.js';
import type { AnyDefinition } from './Definition.js';
import { Definition } from './Definition.js';
import type { InstancesDefinitions } from './sync/InstanceDefinition.js';

export class ClassDefinition<TInstance, TLifeTime extends LifeTime, TConstructorArgs extends any[]> extends Definition<
  TInstance,
  TLifeTime,
  []
> {
  private _hasOnlySyncDependencies = false; // flag for optimization, so we don't have to check every time

  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    public readonly klass: ClassType<TInstance, TConstructorArgs>,
    public readonly dependencies?: Thunk<InstancesDefinitions<TConstructorArgs, TLifeTime>>,
  ) {
    // TODO: perhaps the inner condition for checking deps could be extracted from the critical path
    const create = (use: IContainer): TInstance => {
      // no dependencies
      if (dependencies === undefined) {
        //@ts-ignore
        return new klass();
      }

      const deps = use.all(...unwrapThunk(dependencies)) as TConstructorArgs | Promise<TConstructorArgs>;

      if (this._hasOnlySyncDependencies) {
        return new klass(...(deps as TConstructorArgs));
      }

      if (isPromise(deps)) {
        return deps.then(deps => {
          return new klass(...deps);
        }) as TInstance;
      } else {
        this._hasOnlySyncDependencies = true;

        return new klass(...deps);
      }
    };

    super(id, strategy, create);

    if (Array.isArray(dependencies)) {
      this.assertValidDependencies(dependencies);
    }
  }

  get name() {
    return this.klass.name;
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
