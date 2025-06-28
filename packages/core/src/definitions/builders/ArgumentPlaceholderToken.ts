import type { LifeTime } from '../abstract/LifeTime.js';
import { DefinitionToken, type IDefinitionToken } from '../DefinitionToken.js';
import type { InstancesArray } from '../abstract/InstanceDefinition.js';

export class ArgumentPlaceholderToken<TInstance, TLifeTime extends LifeTime> extends DefinitionToken<
  TInstance,
  TLifeTime
> {
  // @ts-ignore
  private readonly _kind!: 'ArgumentPlaceholder'; // to make it work with `ExactMatch`
}

export type ExactMatch<T, Target> = [T] extends [Target] ? ([Target] extends [T] ? true : false) : false;

export type FilterExact<T extends any[], Match> = T extends [infer Head, ...infer Tail]
  ? ExactMatch<Head, Match> extends true
    ? [Head, ...FilterExact<Tail, Match>]
    : FilterExact<Tail, Match>
  : [];

export type ExcludeExact<T extends any[], Match> = T extends [infer Head, ...infer Tail]
  ? ExactMatch<Head, Match> extends true
    ? ExcludeExact<Tail, Match>
    : [Head, ...ExcludeExact<Tail, Match>]
  : [];

export type HasInstance<T extends readonly any[], Match> = T extends [infer Head, ...infer Tail]
  ? ExactMatch<Head, Match> extends true
    ? true
    : HasInstance<Tail, Match>
  : false;

export type Arguments<T extends IDefinitionToken<any, any>[]> = InstancesArray<
  FilterExact<T, ArgumentPlaceholderToken<any, any>>
>;

export type Dependencies<T extends IDefinitionToken<any, any>[]> = ExcludeExact<T, ArgumentPlaceholderToken<any, any>>;

export type HasArguments<T extends IDefinitionToken<any, any>[]> = HasInstance<T, ArgumentPlaceholderToken<any, any>>;
