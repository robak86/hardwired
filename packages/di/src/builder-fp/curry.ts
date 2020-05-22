import { DefinitionsSet, DependencyResolver, MaterializedModuleEntries, ModuleRegistry } from '..';
import { CurriedFunctionResolver } from '../resolvers/CurriedFunctionResolver';

export type CurriedFn = {
  <TRegistry extends ModuleRegistry, TResult>(fn: () => TResult): (
    registry: DefinitionsSet<TRegistry>,
  ) => DependencyResolver<TRegistry, () => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TResult>(fn: (d1: TDep1) => TResult): (
    registry: DefinitionsSet<TRegistry>,
  ) => DependencyResolver<TRegistry, (d1: TDep1) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TResult>(
    fn: (d1: TDep1) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): (registry: DefinitionsSet<TRegistry>) => DependencyResolver<TRegistry, () => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TResult>(fn: (d1: TDep1, d2: TDep2) => TResult): (
    registry: DefinitionsSet<TRegistry>,
  ) => DependencyResolver<TRegistry, (d1: TDep1, d2: TDep2) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): (registry: DefinitionsSet<TRegistry>) => DependencyResolver<TRegistry, (dep2: TDep2) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2],
  ): (registry: DefinitionsSet<TRegistry>) => DependencyResolver<TRegistry, () => TResult>;
  // 3 args
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TDep3, TResult>(fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult): (
    registry: DefinitionsSet<TRegistry>,
  ) => DependencyResolver<TRegistry, (d1: TDep1, d2: TDep2, d3: TDep3) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1],
  ): (registry: DefinitionsSet<TRegistry>) => DependencyResolver<TRegistry, (dep2: TDep2, dep3: TDep3) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2],
  ): (registry: DefinitionsSet<TRegistry>) => DependencyResolver<TRegistry, (dep3: TDep3) => TResult>;
  <TRegistry extends ModuleRegistry, TDep1, TDep2, TDep3, TResult>(
    fn: (d1: TDep1, d2: TDep2, d3: TDep3) => TResult,
    depSelect: (ctx: MaterializedModuleEntries<TRegistry>) => [TDep1, TDep2, TDep3],
  ): (registry: DefinitionsSet<TRegistry>) => DependencyResolver<TRegistry, () => TResult>;
};

export const curry: CurriedFn = (factory, depSelect?) => registry => new CurriedFunctionResolver(factory, depSelect);
