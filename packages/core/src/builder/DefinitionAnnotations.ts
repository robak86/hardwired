import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';

export type DefinitionAnnotation<TDef extends AnyInstanceDefinition<any, any, any>> = (definition: TDef) => TDef;
