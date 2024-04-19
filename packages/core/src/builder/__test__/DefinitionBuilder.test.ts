import { beforeEach, describe } from 'vitest';
import { getEagerDefinitions } from '../../context/EagerDefinitions.js';
import { DefinitionBuilder } from '../DefinitionBuilder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';

describe(`DefinitionBuilder`, () => {
  beforeEach(() => {
    getEagerDefinitions().clear();
  });

  const singleton = new DefinitionBuilder<[], LifeTime.singleton>([], LifeTime.singleton, false);

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

  describe('sync dependencies', () => {
    describe('class', () => {
      describe('eager', () => {
        it(`adds definition to the global eager entries `, async () => {
          const def = singleton.eager().using(dependencyD).class(MyClass);
          expect(Array.from(getEagerDefinitions().definitions)).toEqual([def]);
        });
      });
    });

    describe('fn', () => {
      describe('eager', () => {
        it(`adds definition to the global eager entries `, async () => {
          const def = singleton
            .using(dependencyD)
            .eager()
            .fn(val => val * 100);

          expect(Array.from(getEagerDefinitions().definitions)).toEqual([def]);
        });
      });
    });

    describe('asyncFn', () => {
      describe('eager', () => {
        it(`adds definition to the global eager entries `, async () => {
          const def = singleton
            .using(dependencyD)
            .eager()
            .async()
            .using(asyncDependencyD)
            .fn(() => 123);

          expect(Array.from(getEagerDefinitions().asyncDefinitions)).toEqual([def]);
        });
      });
    });

    describe('define', () => {
      describe('eager', () => {
        it(`adds definition to the global eager entries `, async () => {
          const def = singleton.eager().define(() => 123);
        });
      });
    });
  });

  describe('async dependencies', () => {
    describe('class', () => {
      describe('eager', () => {
        it(`adds definition to the global eager entries `, async () => {
          const def = singleton //
            .eager()
            .using(dependencyD)
            .async()
            .using(asyncDependencyD)
            .class(OtherClass);
          expect(Array.from(getEagerDefinitions().asyncDefinitions)).toEqual([def]);
        });
      });
    });

    describe('fn', () => {
      describe('eager', () => {
        it(`adds definition to the global eager entries `, async () => {
          const def = singleton
            .using(dependencyD)
            .eager()
            .fn(val => val * 100);

          expect(Array.from(getEagerDefinitions().definitions)).toEqual([def]);
        });
      });
    });

    describe('asyncFn', () => {
      describe('eager', () => {
        it(`adds definition to the global eager entries `, async () => {
          const def = singleton
            .eager()
            .async()
            .using(dependencyD, asyncDependencyD)
            .fn(() => 123);

          expect(Array.from(getEagerDefinitions().asyncDefinitions)).toEqual([def]);
        });
      });
    });

    describe('define', () => {
      describe('eager', () => {
        it(`adds definition to the global eager entries `, async () => {
          const def = singleton.eager().define(() => 123);
          expect(Array.from(getEagerDefinitions().definitions)).toEqual([def]);
        });
      });
    });
  });
});
