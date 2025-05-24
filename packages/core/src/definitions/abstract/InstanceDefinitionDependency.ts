import type { LifeTime } from './LifeTime.js';

/*
  General rules for dependencies lifetime:
  - lifetime should only have references to lifetimes with greater lifetime or equal
 */

// prettier-ignore
export type ValidDependenciesLifeTime<TLifeTime extends LifeTime> =
    TLifeTime extends LifeTime.singleton ?
        | LifeTime.singleton :

        // TODO: transient can have dependencies to scoped or cascading,
        // and since transient is memoized as dependency of singleton therefore we create persistent reference to definition with shorter lifetime
        // singleton -> transient -> scoped|cascading

        // | LifeTime.transient :
    TLifeTime extends LifeTime.transient ?
        | LifeTime.singleton
        | LifeTime.transient
        | LifeTime.scoped
        | LifeTime.cascading :
    TLifeTime extends LifeTime.scoped ?
      // | LifeTime.transient shorter than scoped
        | LifeTime.singleton
        | LifeTime.scoped
        | LifeTime.cascading :
    TLifeTime extends LifeTime.cascading ?
        | LifeTime.singleton
        | LifeTime.cascading :
        // | LifeTime.scoped // TODO: not sure if this is correct. Dependency shouldn't create persistent reference to definition with shorter lifetime
        // | LifeTime.transient
        // TODO: in order to support safely cascading, cascading definition should be injected with other cascading definition marked to be owned by the same scope
        // which is perfectly possible as now we can statically traverse dependencies graphl during the container setup!

        never
