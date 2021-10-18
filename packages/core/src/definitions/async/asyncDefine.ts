import { InstanceDefinition } from '../abstract/InstanceDefinition';
import { PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { v4 } from 'uuid';
import { Resolution } from '../abstract/Resolution';
import { AsyncInstanceDefinition } from '../abstract/AsyncInstanceDefinition';
import { AnyInstanceDefinition } from "../abstract/AnyInstanceDefinition";

export interface DefineAsyncServiceLocator<TExternalParams extends any[]> {
  get<TValue, Externals extends Array<TExternalParams[number]>>(
    instanceDefinition: AnyInstanceDefinition<TValue, any, Externals>,
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

    return {
      id: v4(),
      resolution: Resolution.async,
      strategy: lifetime,
      create: async context => {
        const locator = {
          get: context.buildWithStrategy,
        };

        return buildFn(locator);
      },
      externals,
    };
  };
