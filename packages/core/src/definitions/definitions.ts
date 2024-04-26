import { LifeTime } from './abstract/LifeTime.js';
import { DefinitionBuilder } from '../builder/DefinitionBuilder.js';

export const singleton = new DefinitionBuilder<[], LifeTime.singleton, unknown>([], LifeTime.singleton, {}, []);
export const transient = new DefinitionBuilder<[], LifeTime.transient, unknown>([], LifeTime.transient, {}, []);
export const scoped = new DefinitionBuilder<[], LifeTime.scoped, unknown>([], LifeTime.scoped, {}, []);
