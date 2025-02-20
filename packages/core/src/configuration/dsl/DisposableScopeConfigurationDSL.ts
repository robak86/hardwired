import { DisposableScopeConfigurable } from '../abstract/ScopeConfigurable.js';
import { ScopeConfigurationDSL } from './ScopeConfigurationDSL.js';
import { IContainer } from '../../container/IContainer.js';
import { BindingsRegistry } from '../../context/BindingsRegistry.js';
import { DisposeFn } from '../abstract/ContainerConfigurable.js';

export class DisposableScopeConfigurationDSL extends ScopeConfigurationDSL implements DisposableScopeConfigurable {
  constructor(
    _parentContainer: IContainer,
    _currentContainer: IContainer,
    _bindingsRegistry: BindingsRegistry,
    _tags: (string | symbol)[],
    private _disposeFns: DisposeFn[],
  ) {
    super(_parentContainer, _currentContainer, _bindingsRegistry, _tags);
  }
  onDispose(disposeFn: DisposeFn): void {
    this._disposeFns.push(disposeFn);
  }
}
