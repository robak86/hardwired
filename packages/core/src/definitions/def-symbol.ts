import { LifeTime } from './abstract/LifeTime.js';

// TODO: use just IDefinitionSymbol = symbol & {};
export interface IDefinitionSymbol<TInstance, TLifeTime extends LifeTime> {
  readonly id: symbol;
  readonly strategy: TLifeTime;
  readonly $type: TInstance;

  toString(): string;
}

export class DefinitionSymbol<TInstance, TLifeTime extends LifeTime> {
  public readonly id;

  public readonly $type!: TInstance;

  constructor(
    public readonly strategy: TLifeTime,
    name: string,
  ) {
    this.id = Symbol(name);
  }

  toString() {
    return this.id.toString();
  }
}

export const singleton = <TInstance>(name: string) =>
  new DefinitionSymbol<TInstance, LifeTime.singleton>(LifeTime.singleton, name);

export const transient = <TInstance>(name: string) =>
  new DefinitionSymbol<TInstance, LifeTime.transient>(LifeTime.transient, name);

export const scoped = <TInstance>(name: string) =>
  new DefinitionSymbol<TInstance, LifeTime.scoped>(LifeTime.scoped, name);

export const cascading = <TInstance>(name: string) =>
  new DefinitionSymbol<TInstance, LifeTime.cascading>(LifeTime.cascading, name);
