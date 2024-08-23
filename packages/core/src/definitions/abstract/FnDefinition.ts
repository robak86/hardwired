import { LifeTime } from './LifeTime.js';
import { FnServiceLocator } from '../../container/IContainer.js';
import { v4 } from 'uuid';

export type FnDefinition<T, TLifeTime extends LifeTime, TMeta> = {
  (): T;

  readonly id: string;
  readonly strategy: TLifeTime;
  readonly create: (context: FnServiceLocator) => T;
  readonly meta?: TMeta;
};

export const fnDefinition =
  <TLifeTime extends LifeTime>(lifeTime: TLifeTime) =>
  <TInstance>(create: (locator: FnServiceLocator) => TInstance): FnDefinition<TInstance, TLifeTime, never> => {
    return Object.assign(
      {
        id: v4(),
        strategy: lifeTime,
        create,
      },
      () => {
        throw new Error('Implement me!');
      },
    );
  };
