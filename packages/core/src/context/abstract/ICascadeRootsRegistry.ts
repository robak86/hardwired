import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { ICascadingDefinitionResolver } from '../../container/IContainer.js';

export interface ICascadeRootsRegistryRead {
  hasCascadingRoot(id: symbol): boolean;
}

export interface ICascadeRootsRegistry extends ICascadeRootsRegistryRead {
  setCascadeRoot(defSymbol: IDefinitionSymbol<any, LifeTime.cascading>, container: ICascadingDefinitionResolver): void;
}
