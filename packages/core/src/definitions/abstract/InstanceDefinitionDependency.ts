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
    TLifeTime extends LifeTime.cascading ? // TODO: ensure that this is correct
        | LifeTime.singleton
        | LifeTime.scoped
        | LifeTime.transient
        | LifeTime.cascading :
        never
