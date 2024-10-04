import { DisposableScopeConfigurable } from '../abstract/ScopeConfigurable.js';
import { ScopeConfigurationDSL } from './ScopeConfigurationDSL.js';
import { IContainer, IStrategyAware } from '../../container/IContainer.js';
import { BindingsRegistry } from '../../context/BindingsRegistry.js';
import { DisposeFn, InitFn } from '../abstract/ContainerConfigurable.js';

export class DisposableScopeConfigurationDSL extends ScopeConfigurationDSL implements DisposableScopeConfigurable {
  constructor(
    _parentContainer: IContainer & IStrategyAware,
    _currentContainer: IContainer & IStrategyAware,
    _bindingsRegistry: BindingsRegistry,
    private _disposeFns: DisposeFn[],
  ) {
    super(_parentContainer, _currentContainer, _bindingsRegistry);
  }
  onDispose(disposeFn: InitFn): void {
    this._disposeFns.push(disposeFn);
  }
}
