import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { v4 } from 'uuid';
import { Resolution } from '../abstract/Resolution';
import { ContainerContext } from '../../context/ContainerContext';

export interface DefineServiceLocator<TExternalParams extends any[]> {
  get<TValue, Externals extends Array<TExternalParams[number]>>(
    instanceDefinition: InstanceDefinition<TValue, any, Externals>,
  ): TValue;

  withNewRequestScope<TValue>(fn: (locator: DefineServiceLocator<TExternalParams>) => TValue): TValue;
}

export type DefineBuildFn<TLifeTime extends LifeTime> = TLifeTime extends LifeTime.singleton
  ? {
      <TInstance>(fn: (locator: DefineServiceLocator<PickExternals<[]>>) => TInstance): InstanceDefinition<
        TInstance,
        TLifeTime,
        []
      >;
    }
  : {
      <TInstance>(fn: (locator: DefineServiceLocator<PickExternals<[]>>) => TInstance): InstanceDefinition<
        TInstance,
        TLifeTime,
        []
      >;
      <TExternal extends InstanceDefinition<any, any, any>, TExternals extends [TExternal, ...TExternal[]], TInstance>(
        externals: TExternals,
        fn: (locator: DefineServiceLocator<PickExternals<TExternals>>) => TInstance,
      ): InstanceDefinition<TInstance, TLifeTime, PickExternals<TExternals>>;
    };

export const define =
  <TLifeTime extends LifeTime>(lifetime: TLifeTime): DefineBuildFn<TLifeTime> =>
  (fnOrExternals, fn?): InstanceDefinition<any, any, any> => {
    const buildFn = Array.isArray(fnOrExternals) ? fn : fnOrExternals;
    const externals = Array.isArray(fnOrExternals) ? fnOrExternals : [];

    return {
      id: v4(),
      resolution: Resolution.sync,
      strategy: lifetime,
      create: (context: ContainerContext) => {
        const buildLocator = (context: ContainerContext): DefineServiceLocator<any> => {
          return {
            get: context.buildWithStrategy,
            withNewRequestScope: fn => fn(buildLocator(context.checkoutRequestScope())),
          };
        };

        return buildFn(buildLocator(context));
      },
      externals,
    };
  };
