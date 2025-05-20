import type { LifeTime } from './LifeTime.js';

// prettier-ignore
export type ValidDependenciesLifeTime<TLifeTime extends LifeTime> =
    TLifeTime extends LifeTime.singleton ?
        | LifeTime.singleton
        | LifeTime.transient :
    TLifeTime extends LifeTime.transient ?
        | LifeTime.singleton
        | LifeTime.transient
        | LifeTime.scoped
        | LifeTime.cascading :
    TLifeTime extends LifeTime.scoped ?
        | LifeTime.singleton
        | LifeTime.scoped
        | LifeTime.transient
        | LifeTime.cascading :
    TLifeTime extends LifeTime.cascading ?
        | LifeTime.singleton
        | LifeTime.scoped
        | LifeTime.transient
        // TODO: in order to support safely cascading, cascading definition should be injected with other cascading definition marked to be owned by the same scope
        // which is perfectly possible as now we can statically traverse dependencies graphl during the container setup!
        | LifeTime.cascading :
        never
