import { DisposableScopeConfigurable } from '../abstract/ScopeConfigurable.js';
import { ScopeConfigurationDSL } from './ScopeConfigurationDSL.js';
import { IContainer, IStrategyAware } from '../../container/IContainer.js';
import { BindingsRegistry } from '../../context/BindingsRegistry.js';
import { DisposeFn } from '../abstract/ContainerConfigurable.js';

export class DisposableScopeConfigurationDSL extends ScopeConfigurationDSL implements DisposableScopeConfigurable {
  constructor(
    _currentContainer: IContainer & IStrategyAware,
    _bindingsRegistry: BindingsRegistry,
    _tags: (string | symbol)[],
    private _disposeFns: DisposeFn[],
  ) {
    super(_currentContainer, _bindingsRegistry, _tags);
  }
  onDispose(disposeFn: DisposeFn): void {
    this._disposeFns.push(disposeFn);
  }
}
