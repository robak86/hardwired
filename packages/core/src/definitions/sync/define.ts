import { InstanceDefinition } from '../abstract/base/InstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { ContainerContext } from '../../context/ContainerContext';
import { AsyncInstanceDefinition } from '../abstract/base/AsyncInstanceDefinition';

export interface DefineServiceLocator<TExternalParams extends any[]> {
  get<TValue, Externals extends Array<TExternalParams[number]>>(
    instanceDefinition: InstanceDefinition<TValue, any, Externals>,
  ): TValue;

  getAsync<TValue, Externals extends Array<TExternalParams[number]>>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, Externals>,
  ): Promise<TValue>;

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

    return new InstanceDefinition({
      strategy: lifetime,
      create: (context: ContainerContext) => {
        const buildLocator = (context: ContainerContext): DefineServiceLocator<any> => {
          return {
            get: context.buildWithStrategy,
            getAsync: context.buildWithStrategy,
            withNewRequestScope: fn => fn(buildLocator(context.checkoutRequestScope())),
          };
        };

        return buildFn(buildLocator(context));
      },
      externals,
    });
  };
