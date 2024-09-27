import { LifeTime } from './LifeTime.js';
import { IServiceLocator } from '../../container/IContainer.js';

export class Definition<TInstance, TLifeTime extends LifeTime, TArgs extends any[]> {
  constructor(
    public readonly id: symbol,
    public readonly strategy: TLifeTime,
    public readonly create: (context: IServiceLocator, ...args: TArgs) => TInstance,
  ) {}

  get name() {
    return this.create.name;
  }
}
