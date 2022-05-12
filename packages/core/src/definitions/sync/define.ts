import { InstanceDefinition } from '../abstract/sync/InstanceDefinition';
import { assertNoExternals, pickExternals, PickExternals } from '../../utils/PickExternals';
import { LifeTime } from '../abstract/LifeTime';
import { ContainerContext } from '../../context/ContainerContext';
import { AsyncInstanceDefinition } from '../abstract/async/AsyncInstanceDefinition';
import { Resolution } from '../abstract/Resolution';
import { v4 } from 'uuid';

export interface DefineServiceLocator<TExternalParams> {
  get<TValue, TExternals extends Partial<TExternalParams>>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternals>,
  ): TValue;

  getAsync<TValue, TExternals extends Partial<TExternalParams>>(
    instanceDefinition: AsyncInstanceDefinition<TValue, any, TExternals>,
  ): Promise<TValue>;

  withNewRequestScope<TValue>(fn: (locator: DefineServiceLocator<TExternalParams>) => TValue): TValue;
}

export type DefineBuildFn<TLifeTime extends LifeTime> = TLifeTime extends LifeTime.singleton
  ? {
      <TInstance>(fn: (locator: DefineServiceLocator<PickExternals<[]>>) => TInstance): InstanceDefinition<
        TInstance,
        TLifeTime,
        never
      >;
    }
  : {
      <TInstance>(fn: (locator: DefineServiceLocator<PickExternals<[]>>) => TInstance): InstanceDefinition<
        TInstance,
        TLifeTime,
        never
      >;
      <TExternal extends InstanceDefinition<any, any, any>, TExternals extends [TExternal, ...TExternal[]], TInstance>(
        externals: TExternals,
        fn: (locator: DefineServiceLocator<PickExternals<TExternals>>) => TInstance,
      ): InstanceDefinition<TInstance, TLifeTime, PickExternals<TExternals>>;
    };

export const define = <TLifeTime extends LifeTime>(lifetime: TLifeTime): DefineBuildFn<TLifeTime> =>
  ((fnOrExternals: any, fn?: any) => {
    const buildFn = Array.isArray(fnOrExternals) ? fn : fnOrExternals;
    const externalsArr = Array.isArray(fnOrExternals) ? fnOrExternals : [];
    const externals = pickExternals(externalsArr);
    assertNoExternals(lifetime, externals);

    return {
      id: v4(),
      resolution: Resolution.sync,
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
    };
  }) as any;
