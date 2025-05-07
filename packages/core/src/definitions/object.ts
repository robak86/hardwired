import type { HasPromiseMember } from '../utils/HasPromiseMember.js';
import { isThenable } from '../utils/IsThenable.js';

import type { AwaitedInstanceRecord, InstancesObject, InstancesRecord } from './abstract/InstanceDefinition.js';
import { Definition } from './impl/Definition.js';
import type { LifeTime } from './abstract/LifeTime.js';
import type { AnyDefinition } from './abstract/IDefinition.js';
import type { DerivedLifeTime } from './utils/derivedLifeTime.js';
import { derivedLifeTime } from './utils/derivedLifeTime.js';

export type RecordLifeTime<TRecord extends Record<PropertyKey, Definition<any, any, any>>> = {
  [K in keyof TRecord]: TRecord[K] extends Definition<any, infer TLifeTime, any> ? TLifeTime : never;
}[keyof TRecord];

export type ObjectDefinition<TRecord extends Record<PropertyKey, Definition<any, any, any>>> =
  HasPromiseMember<InstancesObject<TRecord>[keyof InstancesObject<TRecord>]> extends true
    ? Definition<Promise<AwaitedInstanceRecord<TRecord>>, DerivedLifeTime<RecordLifeTime<TRecord>>, []>
    : Definition<InstancesRecord<TRecord>, DerivedLifeTime<RecordLifeTime<TRecord>>, []>;

export const object = <TRecord extends Record<PropertyKey, Definition<unknown, LifeTime, []>>>(
  object: TRecord,
): ObjectDefinition<TRecord> => {
  const entries = Object.entries(object);
  const lifeTimes = entries.map(([, definition]) => definition.strategy);

  return new Definition(Symbol(), derivedLifeTime(lifeTimes), use => {
    const results = {} as InstancesRecord<any>;
    const promises: Promise<void>[] = [];

    for (const [key, definition] of entries) {
      const instance: unknown = use(definition as AnyDefinition);

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
