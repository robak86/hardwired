import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';

export class ContainerConfiguration {
  override(newDef: IDefinition<any, LifeTime>) {}
}
