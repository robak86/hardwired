import type { ClassType } from '../cls.js';
import type { Thunk } from '../../utils/Thunk.js';

import type { LifeTime } from './LifeTime.js';
import type { AnyDefinition } from './Definition.js';
import { Definition } from './Definition.js';
import type { InstancesDefinitions } from './sync/InstanceDefinition.js';

export class ClassDefinition<TInstance, TLifeTime extends LifeTime, TConstructorArgs extends any[]> extends Definition<
  TInstance,
  TLifeTime,
  []
> {
  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    public readonly klass: ClassType<TInstance, TConstructorArgs>,
    public readonly dependencies?: Thunk<InstancesDefinitions<TConstructorArgs, TLifeTime>>,
  ) {
    // TODO: perhaps the inner condition for checking deps could be extracted from the critical path
    super(id, strategy, use => {
      // no dependencies
      if (dependencies === undefined) {
        //@ts-ignore
        return new klass();
      }

      // array dependencies
      if (Array.isArray(dependencies)) {
        return new klass(...(dependencies.map(dep => use(dep)) as TConstructorArgs));
      }

      // thunk dependencies
      return new klass(...(dependencies().map(dep => use(dep)) as TConstructorArgs));
    });

    Array.isArray(dependencies) && this.assertValidDependencies(dependencies);
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
