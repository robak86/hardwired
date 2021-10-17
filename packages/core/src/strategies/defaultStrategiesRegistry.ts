import { StrategiesRegistry } from "./collection/StrategiesRegistry";
import { LifeTime } from "../definitions/abstract/LifeTime";
import { SingletonStrategy } from "./sync/SingletonStrategy";
import { TransientStrategy } from "./sync/TransientStrategy";
import { RequestStrategy } from "./sync/RequestStrategy";
import { ScopeStrategy } from "./sync/ScopeStrategy";
import { AsyncSingletonStrategy } from "./async/AsyncSingletonStrategy";
import { AsyncTransientStrategy } from "./async/AsyncTransientStrategy";
import { AsyncRequestStrategy } from "./async/AsyncRequestStrategy";
import { AsyncScopedStrategy } from "./async/AsyncScopedStrategy";

export const defaultStrategiesRegistry = new StrategiesRegistry(
    {
        [LifeTime.singleton]: new SingletonStrategy(),
        [LifeTime.transient]: new TransientStrategy(),
        [LifeTime.request]: new RequestStrategy(),
        [LifeTime.scoped]: new ScopeStrategy(),
    },
    {
        [LifeTime.singleton]: new AsyncSingletonStrategy(),
        [LifeTime.transient]: new AsyncTransientStrategy(),
        [LifeTime.request]: new AsyncRequestStrategy(),
        [LifeTime.scoped]: new AsyncScopedStrategy(),
    },
);
