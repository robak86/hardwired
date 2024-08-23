import { LifeTime } from './abstract/LifeTime.js';
import { DefinitionBuilder } from '../builder/DefinitionBuilder.js';
import { fnDefinition } from './abstract/FnDefinition.js';

export const singleton = new DefinitionBuilder<[], LifeTime.singleton, unknown>([], LifeTime.singleton, {}, []);
export const transient = new DefinitionBuilder<[], LifeTime.transient, unknown>([], LifeTime.transient, {}, []);
export const scoped = new DefinitionBuilder<[], LifeTime.scoped, unknown>([], LifeTime.scoped, {}, []);

export const fn = {
  singleton: fnDefinition(LifeTime.singleton),
  transient: fnDefinition(LifeTime.transient),
  scoped: fnDefinition(LifeTime.scoped),
};

const def1 = fn.singleton(use => {
  return 123;
});

const asyncDef = fn.singleton(async use => {
  return 123;
});

const def2 = fn.transient(async use => {
  const a = use(def1);
  const asyncDefResult = await use(asyncDef);

  return a + 1 + asyncDefResult;
});

const value = await def2();
