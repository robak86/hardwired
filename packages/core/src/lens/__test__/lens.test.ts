import { expectType, TypeEqual } from 'ts-expect';
import { Lens, lens } from '../lens';

describe(`Lens`, () => {
  describe(`construction`, () => {
    describe(`fromProp`, () => {
      it(`creates correct Lens`, async () => {
        type T1 = number;
        const l1 = lens<T1>().fromProp('someProp');

        expectType<TypeEqual<typeof l1, Lens<{ someProp: number }, number>>>(true);
        expect(l1).toBeInstanceOf(Lens);
      });
    });

    describe(`fromPath`, () => {
      it(`creates correct Lens`, async () => {
        type T1 = number;
        const l1 = lens<T1>().fromPath(['a', 'b']);

        expectType<TypeEqual<typeof l1, Lens<{ a: { b: number } }, number>>>(true);
        expect(l1).toBeInstanceOf(Lens);
      });
    });
  });

  describe(`getOr`, () => {
    it(`returns target value`, async () => {
      const l = lens<number>().fromPath(['a', 'b']);
      const value = l.getOr(123, { a: { b: 456 } });
      expect(value).toEqual(456);
    });

    it(`returns default value if path is not valid`, async () => {
      const l = lens<number>().fromPath(['a', 'b']);
      const value = l.getOr(123, { a: {} } as any);
      expect(value).toEqual(123);
    });

    it(`returns default value if called with null`, async () => {
      const l = lens<number>().fromPath(['a', 'b']);
      const value = l.getOr(123, null as any);
      expect(value).toEqual(123);
    });

    it(`is curried`, async () => {
      const l = lens<number>().fromPath(['a', 'b']);
      const value = l.getOr(123)({ a: { b: 456 } });
      expect(value).toEqual(456);
    });
  });

  describe(`extend`, () => {
    it(`creates path if it's missing`, async () => {
      const l = lens<number>().fromPath(['a', 'b']);
      const value = l.extend(123, {});
      expect(value).toEqual({ a: { b: 123 } });
    });

    it(`throws when null is met on the path`, async () => {
      const l = lens<number>().fromPath(['a', 'b', 'c']);
      expect(() => l.extend(123, { a: { b: null } })).toThrowError('Cannot assign an object to property b set to null');
    });

    it(`throws when null pass as an target object`, async () => {
      const l = lens<number>().fromPath(['a', 'b', 'c']);
      expect(() => l.extend(123, null as any)).toThrowError("Cannot read property 'a' of null");
    });

    it(`is curried`, async () => {
      const l = lens<number>().fromPath(['a', 'b']);
      const value = l.extend(123)({});
      expect(value).toEqual({ a: { b: 123 } });
    });

    describe(`typings`, () => {
      it(`uses correct types`, async () => {
        const l1 = lens<number>().fromProp('a');
        const a = (obj: { b: number }) => l1.extend(123, obj);
        const result = a({ b: 123 });

        expectType<TypeEqual<typeof result, { a: number; b: number }>>(true);
      });

      it(`uses correct types using curry`, async () => {
        const l1 = lens<number>().fromProp('a');
        const a = (obj: { b: number }) => l1.extend(123)(obj);
        const result = a({ b: 123 });

        expectType<TypeEqual<typeof result, { a: number; b: number }>>(true);
      });

      it(`uses correct types with extend target type inferred`, async () => {
        const l1 = lens<number>().fromProp('a');
        const a = <TInput extends object>(obj: TInput) => l1.extend(123, obj);
        const result = a({ b: 123 });

        expectType<TypeEqual<typeof result, { a: number; b: number }>>(true);
      });
    });
  });

  describe(`composition`, () => {
    describe(`append`, () => {
      describe(`get`, () => {
        it(`returns value from composed path`, async () => {
          type Leaf = boolean;
          const l1 = lens<Leaf>().fromProp('container');
          const l2 = lens<{ container: Leaf }>().fromProp('root');
          const composed = l2.append(l1);
          expect(composed.get({ root: { container: true } })).toEqual(true);
        });
      });

      describe(`extend`, () => {
        it(`writes value by creating path from composed lenses`, async () => {
          const l1 = lens<boolean>().fromProp('c');
          const l2 = lens<{ c: boolean }>().fromProp('b');
          const l3 = lens<{ b: { c: boolean } }>().fromProp('a');

          const composed = l3.append(l2).append(l1);
          expect(composed.extend(false, {})).toEqual({
            a: { b: { c: false } },
          });
        });
      });
    });
  });
});
