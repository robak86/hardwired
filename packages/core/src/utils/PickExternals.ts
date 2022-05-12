import { ExternalsDefinitions, WithExternals } from '../definitions/abstract/base/BaseDefinition';
import invariant from 'tiny-invariant';
import { LifeTime } from '../definitions/abstract/LifeTime';
import { set } from '../patching/set';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';

// prettier-ignore
export type PickExternals<T> =
    T extends [] ? never :
    T extends [WithExternals<never>] ? never :
    T extends [WithExternals<infer TExternals>] ? TExternals :
    T extends [WithExternals<never>, ...infer Rest] ? PickExternals<Rest> :
    T extends [WithExternals<infer TExternals>, ...infer Rest] ? TExternals & NeverToUnknown<PickExternals<Rest>>:
    never

export type IsNever<T> = [T] extends [never] ? true : false;
export type NeverToVoid<T> = IsNever<T> extends true ? void : T;
type NeverToUnknown<T> = IsNever<T> extends true ? unknown : T;

export type ExternalsValues<TExternals> = IsNever<TExternals> extends true ? [] : [TExternals];

export const pickExternals = <T extends WithExternals<any>[]>(externals: T): ExternalsDefinitions<PickExternals<T>> => {
  const merged = {} as ExternalsDefinitions<PickExternals<T>>;

  externals.forEach(externalsObj => {
    Object.keys(externalsObj.externals).forEach(key => {
      const current = externalsObj.externals[key];

      if (merged[key as keyof typeof merged]) {
        if (merged[key as keyof typeof merged] !== current) {
          throw new Error(`Multiple externals with id=${current.id} detected.`);
        }
      }

      merged[key as keyof typeof merged] = current;
    });
  });

  return merged;
};

const hasExternals = (externals: ExternalsDefinitions<any>): boolean => {
  return Object.keys(externals).length > 0;
};

export const assertNoExternals = (strategy: LifeTime, externals: ExternalsDefinitions<any>) => {
  if (hasExternals(externals) && strategy === LifeTime.singleton) {
    throw new Error(`Strategy=${strategy} does not support external parameters.`);
  }
};

export const externalsToScopeOverrides = <TExternals>(
  instanceDefinition: WithExternals<TExternals>,
  externals: TExternals,
): InstanceDefinition<any, any, never>[] => {
  return Object.keys(instanceDefinition.externals).map(externalDefId => {
    const externalValue = externals[externalDefId as keyof TExternals];
    const externalDefinition = instanceDefinition.externals[externalDefId as keyof TExternals];

    if (externalValue === undefined) {
      throw new Error(`Missing external value for id=${externalDefId}`);
    }

    return set(externalDefinition, externalValue);
  });
};

export const assertCompatible = (definition: WithExternals<any>, dependencies: WithExternals<any>[]) => {
  const externalKeys = Object.keys(definition.externals);

  invariant(
    dependencies.every(d => {
      return Object.keys(d.externals).every(key => externalKeys.includes(key));
    }),
    `Override does accept additional dependencies with external params`,
  );
};
