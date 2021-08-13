import { ObjectPaths } from '../utils/ObjectPaths';
import { AnyResolver, ModuleRecord } from './Module';
import { PropType } from '../utils/PropType';
import { BuildStrategy } from '../resolvers/abstract/BuildStrategy';
import { ClassType } from '../utils/ClassType';
import { ModuleBuilder } from './ModuleBuilder';

// TODO: reversing args and klass parameters makes ts print more precise error message in case of invalid paramaters
export interface IBindMethod<TRecord extends Record<string, AnyResolver>> {
  <TKey extends string, TValue>(name: TKey, klass: ClassType<TValue, []>): ModuleBuilder<
    TRecord & Record<TKey, BuildStrategy<TValue>>
  >;

  <TKey extends string, TDep1 extends ObjectPaths<ModuleRecord.Materialized<TRecord>>, TValue>(
    name: TKey,
    klass: ClassType<TValue, [PropType<ModuleRecord.Materialized<TRecord>, TDep1>]>,
    args: [TDep1],
  ): ModuleBuilder<TRecord & Record<TKey, BuildStrategy<TValue>>>;

  <
    TKey extends string,
    TDep1 extends ObjectPaths<ModuleRecord.Materialized<TRecord>>,
    TDep2 extends ObjectPaths<ModuleRecord.Materialized<TRecord>>,
    TValue,
  >(
    name: TKey,
    klass: ClassType<
      TValue,
      [PropType<ModuleRecord.Materialized<TRecord>, TDep1>, PropType<ModuleRecord.Materialized<TRecord>, TDep2>]
    >,
    args: [TDep1, TDep2],
  ): ModuleBuilder<TRecord & Record<TKey, BuildStrategy<TValue>>>;

  <
    TKey extends string,
    TDep1 extends ObjectPaths<ModuleRecord.Materialized<TRecord>>,
    TDep2 extends ObjectPaths<ModuleRecord.Materialized<TRecord>>,
    TDep3 extends ObjectPaths<ModuleRecord.Materialized<TRecord>>,
    TValue,
  >(
    name: TKey,
    klass: ClassType<
      TValue,
      [
        PropType<ModuleRecord.Materialized<TRecord>, TDep1>,
        PropType<ModuleRecord.Materialized<TRecord>, TDep2>,
        PropType<ModuleRecord.Materialized<TRecord>, TDep3>,
      ]
    >,
    args: [TDep1, TDep2, TDep3],
  ): ModuleBuilder<TRecord & Record<TKey, BuildStrategy<TValue>>>;
}
