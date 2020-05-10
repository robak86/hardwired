import { DefinitionsSet } from '../DefinitionsSet';

describe(`DefinitionsSet`, () => {
  describe(`forEach`, () => {
    it(`iterates over all imports`, async () => {
      const childDef1 = DefinitionsSet.empty('def1');
      const childDef2 = DefinitionsSet.empty('def2');
      const childDef3 = DefinitionsSet.empty('def3').extendImports('childDef3', childDef2);

      const def1 = DefinitionsSet.empty('def1')
        .extendImports('childDef1', childDef1)
        .extendImports('childDef2', childDef3);

      const iterSpy = jest.fn();
      def1.forEachModule(iterSpy);
      expect(iterSpy).toBeCalledTimes(4);

      expect(iterSpy.mock.calls[0][0]).toEqual(childDef1);
      expect(iterSpy.mock.calls[1][0]).toEqual(childDef2);
      expect(iterSpy.mock.calls[2][0]).toEqual(childDef3);
      expect(iterSpy.mock.calls[3][0]).toEqual(def1);
    });
  });
});
