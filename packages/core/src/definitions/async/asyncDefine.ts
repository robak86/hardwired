import { InstanceDefinition } from '../abstract/base/InstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncInstanceDefinition } from '../abstract/base/AsyncInstanceDefinition';
import { ContainerContext } from '../../context/ContainerContext';

export interface DefineAsyncServiceLocator<TExternalParams extends any[]> {
  get<TValue, Externals extends Array<TExternalParams[number]>>(
    instanceDefinition: InstanceDefinition<TValue, any, Externals>,
  ): TValue;

  getAsync<TValue, Externals extends Array<TExternalParams[number]>>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, Externals>,
  ): Promise<TValue>;

  withNewRequestScope<TValue>(
    fn: (locator: DefineAsyncServiceLocator<TExternalParams>) => Promise<TValue>,
  ): Promise<TValue>;
}

export type DefineAsyncBuildFn<TLifeTime extends LifeTime> = TLifeTime extends LifeTime.singleton
  ? {
      <TInstance>(
        fn: (locator: DefineAsyncServiceLocator<PickExternals<[]>>) => Promise<TInstance>,
      ): AsyncInstanceDefinition<TInstance, TLifeTime, []>;
    }
  : {
      <TInstance>(
        fn: (locator: DefineAsyncServiceLocator<PickExternals<[]>>) => Promise<TInstance>,
      ): AsyncInstanceDefinition<TInstance, TLifeTime, []>;
      <TExternal extends InstanceDefinition<any, any, any>, TExternals extends [TExternal, ...TExternal[]], TInstance>(
        externals: TExternals,
        fn: (locator: DefineAsyncServiceLocator<PickExternals<TExternals>>) => Promise<TInstance>,
      ): AsyncInstanceDefinition<TInstance, TLifeTime, PickExternals<TExternals>>;
    };

export const asyncDefine =
  <TLifeTime extends LifeTime>(lifetime: TLifeTime): DefineAsyncBuildFn<TLifeTime> =>
  (fnOrExternals, fn?): AsyncInstanceDefinition<any, any, any> => {
    const buildFn = Array.isArray(fnOrExternals) ? fn : fnOrExternals;
    const externals = Array.isArray(fnOrExternals) ? fnOrExternals : [];

    return new AsyncInstanceDefinition({
      strategy: lifetime,
      create: async (context: ContainerContext) => {
        const buildLocator = (context: ContainerContext): DefineAsyncServiceLocator<any> => {
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
