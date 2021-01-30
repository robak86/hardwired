import { SelectorResolver } from './resolvers/SelectorResolver';
import { Instance, Module, ModuleBuilder } from 'hardwired';
import { Store } from 'redux';
import { bindDispatchBuilder, DispatchResolverBuilder } from './resolvers/DispatchResolver';
import { bindUseSelector } from './hooks/bindUseSelector';

type SelectorResolverBuilder<TState> = {
  <TReturn>(select: (state: TState) => TReturn): Instance<(state: TState) => TReturn, []>;
  <TReturn, TSelect1>(select: (select1: TSelect1) => TReturn): Instance<
    (state: TState) => TReturn,
    [(state: TState | void) => TSelect1]
  >;

  <TReturn, TSelect1, TSelect2>(select: (select1: TSelect1, select2: TSelect2) => TReturn): Instance<
    (state: TState) => TReturn,
    [(state: TState | void) => TSelect1, (state: TState | void) => TSelect2]
  >;
};

type UseSelectorHook<TState> = {
  <TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
    module: TModule,
    name: TDefinitionName & string,
  ): Module.Materialized<TModule>[TDefinitionName] extends (state: TState) => infer TReturn
    ? TReturn
    : `Definition named ${TDefinitionName} does not return selector`;

  <TState, TReturn>(selector: (state: TState) => TReturn): TReturn;
};

type BoundHardwiredRedux<TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>> = {
  selector: SelectorResolverBuilder<StoreState<TModule, TDefinitionName>>;
  dispatch: DispatchResolverBuilder;
  useSelector: UseSelectorHook<StoreState<TModule, TDefinitionName>>;
};

type StoreState<
  TModule extends ModuleBuilder<any>,
  TDefinitionName extends Module.InstancesKeys<TModule>
> = Module.Materialized<TModule>[TDefinitionName] extends Store<infer TState>
  ? TState
  : `Definition named ${TDefinitionName} does not return redux store`;

export function reduxFor<TModule extends ModuleBuilder<any>, TDefinitionName extends Module.InstancesKeys<TModule>>(
  storeModule: TModule,
  storeDefinitionKey: TDefinitionName & string,
): BoundHardwiredRedux<TModule, TDefinitionName> {
  function selector(select: any): any {
    return new SelectorResolver(select);
  }

  return {
    selector,
    useSelector: bindUseSelector(storeModule, storeDefinitionKey),
    dispatch: bindDispatchBuilder(storeModule, storeDefinitionKey),
  };
}
