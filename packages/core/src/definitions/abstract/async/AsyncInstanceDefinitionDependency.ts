import { LifeTime } from '../LifeTime.js';
import { AnyInstanceDefinition } from '../AnyInstanceDefinition.js';
import { ValidDependenciesLifeTime } from "../sync/InstanceDefinitionDependency.js";

export type AsyncInstanceDefinitionDependency<TValue, TLifeTime extends LifeTime> = AnyInstanceDefinition<TValue, ValidDependenciesLifeTime<TLifeTime>>

