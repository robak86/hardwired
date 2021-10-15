import { uncurry } from '../UnCurry';
import { expectType, TypeEqual } from 'ts-expect';

describe(`uncurry`, () => {
  describe(`fn without params`, () => {
    it(`returns correct function`, async () => {
      const fn = () => 123;
      const unCurried = uncurry(fn);
      expect(unCurried()).toEqual(123);
    });
  });

  describe(`fn with rest args`, () => {
    it(`returns non callable type wit error message`, async () => {
      const fn = (...args: any[]) => args;
      const unCurried = uncurry(fn);
      expectType<TypeEqual<typeof unCurried, '...rest arguments are not supported'>>(true);
    });
  });

  describe(`fn with single param`, () => {
    it(`returns correct function`, async () => {
      const fn = (input: number) => [input];
      const unCurried = uncurry(fn);
      expect(unCurried(123)).toEqual([123]);
    });
  });

  describe(`fn with two params`, () => {
    it(`returns correct function`, async () => {
      const fn = (input: number, input2: string) => [input, input2];
      const unCurried = uncurry(fn);
      expect(unCurried(123, '123')).toEqual([123, '123']);
    });
  });

  describe(`three nested functions`, () => {
    it(`both functions have params`, async () => {
      const fn = (input: number) => (input2: string) => (input3: number) => [input, input2, input3];
      const unCurried = uncurry(fn);
      expect(unCurried(123, '123', 456)).toEqual([123, '123', 456]);
    });

    it(`only second fn takes params`, async () => {
      const fn = () => (input2: string) => () => [input2];
      const unCurried = uncurry(fn);
      expect(unCurried('123')).toEqual(['123']);
    });

    it(`only first fn takes params`, async () => {
      const fn = (input: number) => () => [input];
      const unCurried = uncurry(fn);
      expect(unCurried(123)).toEqual([123]);
    });

    it(`both functions don't take any params`, async () => {
      const fn = () => () => 'result';
      const unCurried = uncurry(fn);
      expect(unCurried()).toEqual('result');
    });
  });

  describe(`two nested functions`, () => {
    it(`both functions have params`, async () => {
      const fn = (input: number) => (input2: string) => [input, input2];
      const unCurried = uncurry(fn);
      expect(unCurried(123, '123')).toEqual([123, '123']);
    });

    it(`only second fn takes params`, async () => {
      const fn = () => (input2: string) => [input2];
      const unCurried = uncurry(fn);
      expect(unCurried('123')).toEqual(['123']);
    });

    it(`only first fn takes params`, async () => {
      const fn = (input: number) => () => () => [input];
      const unCurried = uncurry(fn);
      expect(unCurried(123)).toEqual([123]);
    });

    it(`no function takes any params`, async () => {
      const fn = () => () => () => 'result';
      const unCurried = uncurry(fn);
      expect(unCurried()).toEqual('result');
    });
  });
});
