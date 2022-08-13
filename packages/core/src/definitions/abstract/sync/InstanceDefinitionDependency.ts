import { LifeTime } from '../LifeTime.js';
import { InstanceDefinition } from './InstanceDefinition.js';
import { AnyInstanceDefinition } from '../AnyInstanceDefinition.js';

// prettier-ignore
export type InstanceDefinitionDependency<TValue, TLifeTime extends LifeTime> = InstanceDefinition<TValue, ValidDependenciesLifeTime<TLifeTime>>

// prettier-ignore
export type ValidDependenciesLifeTime<TLifeTime extends LifeTime> =
    TLifeTime extends LifeTime.singleton ?
        | LifeTime.singleton
        | LifeTime.transient
        | LifeTime.request :
    TLifeTime extends LifeTime.transient ?
        | LifeTime.singleton
        | LifeTime.transient
        | LifeTime.scoped
        | LifeTime.request :
    TLifeTime extends LifeTime.request ?
        | LifeTime.singleton
        | LifeTime.request
        | LifeTime.scoped
        | LifeTime.transient :
    TLifeTime extends LifeTime.scoped ?
        | LifeTime.singleton
        | LifeTime.request
        | LifeTime.scoped
        | LifeTime.transient :
        never

// TODO: optimize
const validLifeTimes = {
    [LifeTime.singleton]: [LifeTime.singleton, LifeTime.request, LifeTime.transient],
    [LifeTime.transient]: [LifeTime.singleton, LifeTime.request, LifeTime.transient, LifeTime.scoped],
    [LifeTime.request]: [LifeTime.singleton, LifeTime.request, LifeTime.transient, LifeTime.scoped],
    [LifeTime.scoped]: [LifeTime.singleton, LifeTime.request, LifeTime.transient, LifeTime.scoped],
};

export const assertValidDependency = (lifeTime: LifeTime, deps: AnyInstanceDefinition<any, any>[]) => {
    const valid = validLifeTimes[lifeTime] || [];

    for (let dependency of deps) {
        const isValid = valid.some(allowedLifeTime => dependency.strategy === allowedLifeTime);

        if (!isValid) {
            throw new Error(`Cannot use ${dependency.strategy} dependency for ${lifeTime} definition.`);
        }
    }
};
