import type { Definition } from '../impl/Definition.js';

import { LifeTime } from './LifeTime.js';

export type InstanceDefinitionDependency<TValue, TLifeTime extends LifeTime> = Definition<
  TValue,
  ValidDependenciesLifeTime<TLifeTime>,
  any
>;

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

const validLifeTimes = {
  [LifeTime.singleton]: {
    [LifeTime.singleton]: true,
    [LifeTime.transient]: true,
    [LifeTime.scoped]: false, // singleton shouldn't have scoped dependencies
  },
  [LifeTime.transient]: {
    [LifeTime.singleton]: true,
    [LifeTime.transient]: true,
    [LifeTime.scoped]: true,
  },
  [LifeTime.scoped]: {
    [LifeTime.singleton]: true,
    [LifeTime.transient]: true,
    [LifeTime.scoped]: true,
  },
} as const;

// TODO: decide if the correct definition life time should be checked at runtime
export const assertValidDependencies = (lifeTime: LifeTime, deps: Definition<any, LifeTime, any>[]) => {
  for (const dependency of deps) {
    assertValidDependency(lifeTime, dependency);
  }
};

export const assertValidDependency = (lifeTime: LifeTime, dep: Definition<any, LifeTime, any>) => {
  const isValid = validLifeTimes[lifeTime][dep.strategy];

  if (!isValid) {
    throw new Error(`Cannot use ${dep.strategy} dependency for ${lifeTime} definition.`);
  }
};
