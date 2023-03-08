import { LifeTime } from '../LifeTime.js';
import { InstanceDefinition } from './InstanceDefinition.js';
import { AnyInstanceDefinition } from '../AnyInstanceDefinition.js';

// prettier-ignore
export type InstanceDefinitionDependency<TValue, TLifeTime extends LifeTime> = InstanceDefinition<TValue, ValidDependenciesLifeTime<TLifeTime>>

// prettier-ignore
export type ValidDependenciesLifeTime<TLifeTime extends LifeTime> =
    TLifeTime extends LifeTime.singleton ?
        | LifeTime.singleton
        | LifeTime.transient
        | LifeTime.request :
    TLifeTime extends LifeTime.transient ?
        | LifeTime.singleton
        | LifeTime.transient
        | LifeTime.scoped
        | LifeTime.request :
    TLifeTime extends LifeTime.request ?
        | LifeTime.singleton
        | LifeTime.request
        | LifeTime.scoped
        | LifeTime.transient :
    TLifeTime extends LifeTime.scoped ?
        | LifeTime.singleton
        | LifeTime.request
        | LifeTime.scoped
        | LifeTime.transient :
        never

const validLifeTimes = {
  [LifeTime.singleton]: {
    [LifeTime.singleton]: true,
    [LifeTime.request]: true,
    [LifeTime.transient]: true,
    [LifeTime.scoped]: false, // scoped is invalid
  },
  [LifeTime.transient]: {
    [LifeTime.singleton]: true,
    [LifeTime.request]: true,
    [LifeTime.transient]: true,
    [LifeTime.scoped]: true,
  },
  [LifeTime.request]: {
    [LifeTime.singleton]: true,
    [LifeTime.request]: true,
    [LifeTime.transient]: true,
    [LifeTime.scoped]: true,
  },
  [LifeTime.scoped]: {
    [LifeTime.singleton]: true,
    [LifeTime.request]: true,
    [LifeTime.transient]: true,
    [LifeTime.scoped]: true,
  },
} as const

export const assertValidDependency = (lifeTime: LifeTime, deps: AnyInstanceDefinition<any, LifeTime>[]) => {
  for (let dependency of deps) {
    const isValid = validLifeTimes[lifeTime][dependency.strategy];

    if (!isValid) {
      throw new Error(`Cannot use ${dependency.strategy} dependency for ${lifeTime} definition.`);
    }
  }
};
