import { LifeTime } from './abstract/LifeTime.js';

export interface IDefinitionToken<TInstance, TLifeTime extends LifeTime> {
  readonly id: symbol;
  readonly strategy: TLifeTime;
  readonly $type: TInstance;

  toString(): string;
}

export class DefinitionToken<TInstance, TLifeTime extends LifeTime> implements IDefinitionToken<TInstance, TLifeTime> {
  public readonly id;

  public readonly $type!: TInstance;

  constructor(
    public readonly strategy: TLifeTime,
    name?: string,
  ) {
    this.id = Symbol(name);
  }

  toString() {
    return this.id.toString();
  }
}

export const singleton = <TInstance>(name?: string) =>
  new DefinitionToken<TInstance, LifeTime.singleton>(LifeTime.singleton, name);

export const transient = <TInstance>(name?: string) =>
  new DefinitionToken<TInstance, LifeTime.transient>(LifeTime.transient, name);

export const scoped = <TInstance>(name?: string) =>
  new DefinitionToken<TInstance, LifeTime.scoped>(LifeTime.scoped, name);

export const cascading = <TInstance>(name?: string) =>
  new DefinitionToken<TInstance, LifeTime.cascading>(LifeTime.cascading, name);
