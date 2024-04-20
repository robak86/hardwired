import { beforeEach, describe } from 'vitest';

import { DefinitionBuilder } from '../DefinitionBuilder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';

describe(`DefinitionBuilder`, () => {
  const singleton = new DefinitionBuilder<[], LifeTime.singleton>([], LifeTime.singleton, {}, []);

  const dependencyD = singleton.fn(() => 123);
  const asyncDependencyD = singleton.async().fn(async () => 'someStr');

  class MyClass {
    constructor(private a: number) {}
  }

  class OtherClass {
    constructor(
      private a: number,
      private b: string,
    ) {}
  }

  describe.todo(`.annotate`, () => {});
});
