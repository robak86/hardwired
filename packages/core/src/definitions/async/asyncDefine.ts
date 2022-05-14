import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { assertNoExternals, pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition';
import { ContainerContext } from '../../context/ContainerContext';
import { v4 } from 'uuid';
import { Resolution } from '../abstract/Resolution';
import { ExternalsDefinitions } from '../abstract/base/BaseDefinition';

export interface DefineAsyncServiceLocator<TExternalParams> {
  get<TValue>(instanceDefinition: InstanceDefinition<TValue, any, Partial<TExternalParams>>): TValue;

  getAsync<TValue>(instanceDefinition: AsyncInstanceDefinition<TValue, any, Partial<TExternalParams>>): Promise<TValue>;

  withNewRequestScope<TValue>(
    fn: (locator: DefineAsyncServiceLocator<TExternalParams>) => Promise<TValue>,
  ): Promise<TValue>;
}

export type DefineAsyncBuildFn<TLifeTime extends LifeTime> = TLifeTime extends LifeTime.singleton
  ? {
      <TInstance>(
        fn: (locator: DefineAsyncServiceLocator<PickExternals<[]>>) => Promise<TInstance>,
      ): AsyncInstanceDefinition<TInstance, TLifeTime, never>;
    }
  : {
      <TInstance>(
        fn: (locator: DefineAsyncServiceLocator<PickExternals<[]>>) => Promise<TInstance>,
      ): AsyncInstanceDefinition<TInstance, TLifeTime, never>;
      <TExternal extends InstanceDefinition<any, any, any>, TExternals extends [TExternal, ...TExternal[]], TInstance>(
        externals: TExternals,
        fn: (locator: DefineAsyncServiceLocator<PickExternals<TExternals>>) => Promise<TInstance>,
      ): AsyncInstanceDefinition<TInstance, TLifeTime, PickExternals<TExternals>>;
    };

export const asyncDefine = <TLifeTime extends LifeTime>(lifetime: TLifeTime): DefineAsyncBuildFn<TLifeTime> =>
  ((fnOrExternals: any, fn?: any): AsyncInstanceDefinition<any, any, any> => {
    const buildFn = Array.isArray(fnOrExternals) ? fn : fnOrExternals;
    const externalsArr = Array.isArray(fnOrExternals) ? fnOrExternals : [];

    const externals = pickExternals(externalsArr);
    assertNoExternals(lifetime, externals);

    return {
      id: v4(),
      resolution: Resolution.async,
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
    };
  }) as any;
