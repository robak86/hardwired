import { LifeTime } from '../abstract/LifeTime.js';

type IsUnion<T, B = T> = T extends B ? ([B] extends [T] ? false : true) : never;

// prettier-ignore
export type DerivedLifeTime<T extends LifeTime> =
  IsUnion<T> extends true ? LifeTime.transient : T;

export const derivedLifeTime = <TLifeTime extends LifeTime[]>(lifeTimes: TLifeTime): LifeTime => {
  const firstStrategy = lifeTimes[0];

  return firstStrategy
    ? lifeTimes.every(lifeTime => lifeTime === firstStrategy)
      ? firstStrategy
      : LifeTime.transient
    : LifeTime.transient;
};
