import { expectType } from 'ts-expect';

import type { ArgumentPlaceholderToken, ExactMatch, HasArguments, HasInstance } from '../ArgumentPlaceholderToken.js';
import type { DefinitionToken } from '../../DefinitionToken.js';
import type { LifeTime } from '../../abstract/LifeTime.js';
import type { Definition } from '../../impl/Definition.js';

describe(`HasArguments`, () => {
  describe(`ExactMatch`, () => {
    it(`works with subclasses`, async () => {
      expectType<ExactMatch<ArgumentPlaceholderToken<any, any>, Definition<any, any>>>(false);
      expectType<ExactMatch<Definition<any, any>, Definition<any, any>>>(true);
    });
  });

  describe(`HasInstance`, () => {
    it(`returns true if tuple contains ArgumentPlaceholderToken`, async () => {
      type TestType = [number, string];

      expectType<HasInstance<TestType, number>>(true);
    });

    it(`returns false for empty tuple`, async () => {
      type TestType = [];

      expectType<HasArguments<TestType>>(false);
    });

    it(`returns false if there is no ArgumentPlaceholderToken in the tuple`, async () => {
      type TestType = [string];

      expectType<HasInstance<TestType, number>>(false);
    });
  });

  it(`returns true if tuple contains ArgumentPlaceholderToken`, async () => {
    type TestType = [ArgumentPlaceholderToken<string, LifeTime>, DefinitionToken<number, LifeTime>];

    expectType<HasArguments<TestType>>(true);
  });

  it(`returns false for empty tuple`, async () => {
    type TestType = [];

    expectType<HasArguments<TestType>>(false);
  });

  it(`returns false if there is no ArgumentPlaceholderToken in the tuple`, async () => {
    type TestType = [DefinitionToken<number, LifeTime>];

    expectType<HasArguments<TestType>>(false);
  });
});
