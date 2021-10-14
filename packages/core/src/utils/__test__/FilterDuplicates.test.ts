import { filterDuplicates, FilterDuplicates } from '../FilterDuplicates';
import { expectType, TypeEqual } from 'ts-expect';

describe(`FilterDuplicates`, () => {
  describe(`types`, () => {
    it(`returns tuple without duplicates, ex.1`, async () => {
      type Result = FilterDuplicates<[1, 2, 3, 4, 5]>;
      expectType<TypeEqual<Result, [1, 2, 3, 4, 5]>>(true);
    });

    it(`returns tuple without duplicates, ex.2`, async () => {
      type Result = FilterDuplicates<[1, 1, 2, 2, 3, 4, 5]>;
      expectType<TypeEqual<Result, [1, 2, 3, 4, 5]>>(true);
    });

    it(`returns tuple without duplicates, ex.3`, async () => {
      type Result = FilterDuplicates<[5, 1, 2, 4, 2, 2, 3, 2, 4, 1, 5]>;
      expectType<TypeEqual<Result, [5, 1, 2, 4, 3]>>(true);
    });

    it(`returns tuple without duplicates, ex.4`, async () => {
      type Result = FilterDuplicates<[]>;
      expectType<TypeEqual<Result, []>>(true);
    });

    it(`returns tuple without duplicates, ex.5`, async () => {
      type Result = FilterDuplicates<string[]>;
      expectType<TypeEqual<Result, string[]>>(true);
    });
  });

  describe(`runtime`, () => {
    it(`returns tuple without duplicates, ex.1`, async () => {
      const result = filterDuplicates([1, 2, 3, 4, 5]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it(`returns tuple without duplicates, ex.2`, async () => {
      const result = filterDuplicates([1, 1, 2, 2, 3, 4, 5]);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it(`returns tuple without duplicates, ex.3`, async () => {
      const result = filterDuplicates([5, 1, 2, 4, 2, 2, 3, 2, 4, 1, 5]);
      expect(result).toEqual([5, 1, 2, 4, 3]);
    });

    it(`returns tuple without duplicates, ex.4`, async () => {
      const result = filterDuplicates([]);
      expect(result).toEqual([]);
    });
  });
});
