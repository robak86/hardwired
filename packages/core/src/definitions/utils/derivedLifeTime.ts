import { LifeTime } from '../abstract/LifeTime.js';

// prettier-ignore
export type DerivedLifeTime<T extends LifeTime> =
  [T] extends [never] ? LifeTime.transient :
  [T] extends [LifeTime.transient] ? LifeTime.transient :
  [T] extends [LifeTime.scoped] ? LifeTime.scoped :
  [T] extends [LifeTime.singleton] ? LifeTime.singleton :
  [T] extends [LifeTime.transient | LifeTime.scoped] ? LifeTime.transient :
  [T] extends [LifeTime.transient | LifeTime.singleton] ? LifeTime.transient :
  [T] extends [LifeTime.scoped | LifeTime.singleton] ? LifeTime.scoped :
  [T] extends [LifeTime.transient | LifeTime.scoped | LifeTime.singleton] ? LifeTime.transient :
  never;

export const derivedLifeTime = <TLifeTime extends LifeTime[]>(
  lifeTimes: TLifeTime,
): DerivedLifeTime<TLifeTime[number]> => {
  if (lifeTimes.length === 0) {
    return LifeTime.transient as DerivedLifeTime<TLifeTime[number]>;
  }

  let hasScoped = false;
  let hasSingleton = false;

  for (const lt of lifeTimes) {
    if (lt === LifeTime.transient) {
      return LifeTime.transient as DerivedLifeTime<TLifeTime[number]>;
    } else if (lt === LifeTime.scoped) {
      hasScoped = true;
    } else if (lt === LifeTime.singleton) {
      hasSingleton = true;
    }
  }

  if (hasScoped) {
    return LifeTime.scoped as DerivedLifeTime<TLifeTime[number]>;
  }

  if (hasSingleton) {
    return LifeTime.singleton as DerivedLifeTime<TLifeTime[number]>;
  }

  throw new Error('Invalid lifeTimes array');
};
