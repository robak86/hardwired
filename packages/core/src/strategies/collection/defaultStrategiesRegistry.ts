import { StrategiesRegistry } from './StrategiesRegistry';
import { LifeTime } from '../../definitions/abstract/LifeTime';
import { SingletonStrategy } from '../SingletonStrategy';
import { TransientStrategy } from '../TransientStrategy';
import { RequestStrategy } from '../RequestStrategy';
import { ScopeStrategy } from '../ScopeStrategy';

export const defaultStrategiesRegistry = new StrategiesRegistry({
  [LifeTime.singleton]: new SingletonStrategy(),
  [LifeTime.transient]: new TransientStrategy(),
  [LifeTime.request]: new RequestStrategy(),
  [LifeTime.scoped]: new ScopeStrategy(),
});
