import { TypeEqual } from 'ts-expect';
import { LifeTime } from './LifeTime';

// prettier-ignore
export type DerivedLifeTime<T extends LifeTime> =
    T extends LifeTime.singleton ? LifeTime.singleton: // if even single lifetime is singleton we need to propagate this
    TypeEqual<T, LifeTime.request> extends true ? LifeTime.request :
    TypeEqual<T, LifeTime.scoped> extends true ? LifeTime.scoped :
    LifeTime.transient;

export const derivedLifeTime = (lifeTimes: LifeTime[]): LifeTime => {
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
