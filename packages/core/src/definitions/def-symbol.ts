import { LifeTime } from './abstract/LifeTime.js';

export class DefinitionSymbol<TInstance, TLifeTime extends LifeTime> {
  public readonly id = Symbol(); // Or just use WeakMap

  public readonly $type!: NoInfer<Awaited<TInstance>>;

  constructor(
    public readonly strategy: TLifeTime,
    public readonly name?: string,
  ) {}
}

export const singleton = <TInstance>(name?: string) =>
  new DefinitionSymbol<TInstance, LifeTime.singleton>(LifeTime.singleton, name);

export const transient = <TInstance>(name?: string) =>
  new DefinitionSymbol<TInstance, LifeTime.transient>(LifeTime.transient, name);

export const scoped = <TInstance>(name?: string) =>
  new DefinitionSymbol<TInstance, LifeTime.scoped>(LifeTime.scoped, name);

export const cascading = <TInstance>(name?: string) =>
  new DefinitionSymbol<TInstance, LifeTime.cascading>(LifeTime.cascading, name);
