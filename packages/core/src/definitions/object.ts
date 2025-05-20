import type { HasPromiseMember } from '../utils/HasPromiseMember.js';
import { isThenable } from '../utils/IsThenable.js';

import type { AwaitedInstanceRecord, InstancesObject, InstancesRecord } from './abstract/InstanceDefinition.js';
import { Definition } from './impl/Definition.js';
import type { LifeTime } from './abstract/LifeTime.js';
import type { AnyDefinitionSymbol, IDefinition } from './abstract/IDefinition.js';
import type { DerivedLifeTime } from './utils/derivedLifeTime.js';
import { derivedLifeTime } from './utils/derivedLifeTime.js';

export type RecordLifeTime<TRecord extends Record<PropertyKey, IDefinition<any, any>>> = {
  [K in keyof TRecord]: TRecord[K] extends IDefinition<any, infer TLifeTime> ? TLifeTime : never;
}[keyof TRecord];

export type ObjectDefinition<TRecord extends Record<PropertyKey, IDefinition<any, any>>> =
  HasPromiseMember<InstancesObject<TRecord>[keyof InstancesObject<TRecord>]> extends true
    ? IDefinition<Promise<AwaitedInstanceRecord<TRecord>>, DerivedLifeTime<RecordLifeTime<TRecord>>, []>
    : IDefinition<InstancesRecord<TRecord>, DerivedLifeTime<RecordLifeTime<TRecord>>, []>;

export const object = <TRecord extends Record<PropertyKey, IDefinition<unknown, LifeTime>>>(
  object: TRecord,
): ObjectDefinition<TRecord> => {
  const entries = Object.entries(object);
  const lifeTimes = entries.map(([, definition]) => definition.strategy);

  return new Definition(Symbol(), derivedLifeTime(lifeTimes), use => {
    const results = {} as InstancesRecord<any>;
    const promises: Promise<void>[] = [];

    for (const [key, definition] of entries) {
      const instance: unknown = use(definition as AnyDefinitionSymbol);

      if (isThenable(instance)) {
        promises.push(
          instance.then(value => {
            results[key] = value;
          }),
        );
      } else {
        results[key] = instance;
      }
    }

    if (promises.length > 0) {
      return Promise.all(promises).then(() => results);
    } else {
      return results;
    }
  }) as ObjectDefinition<TRecord>;
};
