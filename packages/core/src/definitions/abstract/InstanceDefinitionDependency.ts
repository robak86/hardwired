import type { LifeTime } from './LifeTime.js';

// prettier-ignore
export type ValidDependenciesLifeTime<TLifeTime extends LifeTime> =
    TLifeTime extends LifeTime.singleton ?
        | LifeTime.singleton
        | LifeTime.transient :
    TLifeTime extends LifeTime.transient ?
        | LifeTime.singleton
        | LifeTime.transient
        | LifeTime.scoped :
    TLifeTime extends LifeTime.scoped ?
        | LifeTime.singleton
        | LifeTime.scoped
        | LifeTime.transient :
        never
