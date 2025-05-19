import type { DefinitionSymbol } from '../../definitions/def-symbol.js';
import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { ClassType } from '../../definitions/cls.js';
import type { ValidDependenciesLifeTime } from '../../definitions/abstract/InstanceDefinitionDependency.js';
import type { MaybePromise } from '../../utils/async.js';
import { ClassDefinition } from '../../definitions/impl/ClassDefinition.js';

export type ConstructorArgsSymbols<T extends any[], TCurrentLifeTime extends LifeTime> = {
  [K in keyof T]: DefinitionSymbol<T[K] | Promise<T[K]>, ValidDependenciesLifeTime<TCurrentLifeTime>>;
};

export class SymbolsBindingDSL<TInstance, TLifeTime extends LifeTime> {
  constructor(public readonly def: DefinitionSymbol<TInstance, TLifeTime>) {}

  cls<TConstructorArgs extends any[]>(
    klass: ClassType<TInstance, TConstructorArgs>,
    ...dependencies: ConstructorArgsSymbols<TConstructorArgs, TLifeTime>
  ) {
    const definition = new ClassDefinition(this.def.id, this.def.strategy, klass, dependencies);
  }

  fn<TArgs extends any[]>(
    fn: (...args: TArgs) => MaybePromise<TInstance>,
    ...dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>
  ) {
    throw new Error('Implement me!');
  }
}
