import { expectType, TypeEqual } from 'ts-expect';
import { uncurryAsync } from '../UnCurryAsync';

describe(`uncurryAsync`, () => {
  describe(`fn without params`, () => {
    it(`returns correct function`, async () => {
      const fn = async () => 123;
      const unCurried = uncurryAsync(fn);
      expect(await unCurried()).toEqual(123);
    });
  });

  describe(`fn with rest args`, () => {
    it(`returns never`, async () => {
      const fn = async (...args: any[]) => args;
      const unCurried = uncurryAsync(fn);
      expectType<TypeEqual<typeof unCurried, never>>(true);
    });
  });

  describe(`fn with single param`, () => {
    it(`returns correct function`, async () => {
      const fn = async (input: number) => [input];
      const unCurried = uncurryAsync(fn);
      expect(await unCurried(123)).toEqual([123]);
    });
  });

  describe(`fn with two params`, () => {
    it(`returns correct function`, async () => {
      const fn = async (input: number, input2: string) => [input, input2];
      const unCurried = uncurryAsync(fn);
      expect(await unCurried(123, '123')).toEqual([123, '123']);
    });
  });

  describe(`three nested functions`, () => {
    it(`both functions have params`, async () => {
      const fn = async (input: number) => (input2: string) => (input3: number) => [input, input2, input3];
      const unCurried = uncurryAsync(fn);
      expect(await unCurried(123, '123', 456)).toEqual([123, '123', 456]);
    });

    it(`only second fn takes params`, async () => {
      const fn = async () => (input2: string) => () => [input2];
      const unCurried = uncurryAsync(fn);
      expect(await unCurried('123')).toEqual(['123']);
    });

    it(`only first fn takes params`, async () => {
      const fn = async (input: number) => () => [input];
      const unCurried = uncurryAsync(fn);
      expect(await unCurried(123)).toEqual([123]);
    });

    it(`both functions don't take any params`, async () => {
      const fn = async () => () => 'result';
      const unCurried = uncurryAsync(fn);
      expect(await unCurried()).toEqual('result');
    });
  });

  describe(`two nested functions`, () => {
    it(`both functions have params`, async () => {
      const fn = async (input: number) => (input2: string) => [input, input2];
      const unCurried = uncurryAsync(fn);
      expect(await unCurried(123, '123')).toEqual([123, '123']);
    });

    it(`only second fn takes params`, async () => {
      const fn = async () => (input2: string) => [input2];
      const unCurried = uncurryAsync(fn);
      expect(await unCurried('123')).toEqual(['123']);
    });

    it(`only first fn takes params`, async () => {
      const fn = async (input: number) => () => () => [input];
      const unCurried = uncurryAsync(fn);
      expect(await unCurried(123)).toEqual([123]);
    });

    it(`no function takes any params`, async () => {
      const fn = async () => () => () => 'result';
      const unCurried = uncurryAsync(fn);
      expect(await unCurried()).toEqual('result');
    });
  });
});
