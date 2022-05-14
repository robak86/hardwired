import { TypeEqual } from 'ts-expect';
import { LifeTime } from '../abstract/LifeTime';

// prettier-ignore
export type DerivedLifeTime<T extends LifeTime> =
    // if even single lifetime is singleton we need to propagate this up to the place where definition is used in factory,
    // because factory cannot use singleton definition having external params - singletons are not revalidated on external params change
    T extends LifeTime.singleton ? LifeTime.singleton:
    TypeEqual<T, LifeTime.request> extends true ? LifeTime.request :
    TypeEqual<T, LifeTime.scoped> extends true ? LifeTime.scoped :
    LifeTime.transient;

export const derivedLifeTime = <TLifeTime extends LifeTime[]>(lifeTimes: TLifeTime): LifeTime => {
  if (lifeTimes.some(l => l === LifeTime.singleton)) {
    return LifeTime.singleton;
  }

  const firstStrategy = lifeTimes[0];

  return firstStrategy
    ? lifeTimes.every(lifeTime => lifeTime === firstStrategy)
      ? firstStrategy
      : LifeTime.transient
    : LifeTime.transient;
};
