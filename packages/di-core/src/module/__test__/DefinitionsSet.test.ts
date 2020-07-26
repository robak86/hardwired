import { ModuleRegistry } from '../ModuleRegistry';
import { DependencyResolver } from '../../resolvers/DependencyResolver';

describe(`ModuleRegistry`, () => {
  describe(`forEachModuleReversed`, () => {
    it(`iterates over all imports`, async () => {
      const childDef1 = ModuleRegistry.empty('def1');
      const childDef2 = ModuleRegistry.empty('def2');
      const childDef3 = ModuleRegistry.empty('def3').extendImports('childDef3', childDef2);

      const def1 = ModuleRegistry.empty('def1')
        .extendImports('childDef1', childDef1)
        .extendImports('childDef2', childDef3);

      const iterSpy = jest.fn();
      def1.forEachModuleReversed(iterSpy);
      expect(iterSpy).toBeCalledTimes(4);

      expect(iterSpy.mock.calls[0][0]).toEqual(childDef2);
      expect(iterSpy.mock.calls[1][0]).toEqual(childDef3);
      expect(iterSpy.mock.calls[2][0]).toEqual(childDef1);
      expect(iterSpy.mock.calls[3][0]).toEqual(def1);
    });
  });

  describe(`forEachModule`, () => {
    it(`iterates over all imports`, async () => {
      const childDef1 = ModuleRegistry.empty('def1');
      const childDef2 = ModuleRegistry.empty('def2');
      const childDef3 = ModuleRegistry.empty('def3').extendImports('childDef3', childDef2);

      const def1 = ModuleRegistry.empty('def1')
          .extendImports('childDef1', childDef1)
          .extendImports('childDef2', childDef3);

      const iterSpy = jest.fn();
      def1.forEachModule(iterSpy);
      expect(iterSpy).toBeCalledTimes(4);

      expect(iterSpy.mock.calls[0][0]).toEqual(def1);
      expect(iterSpy.mock.calls[1][0]).toEqual(childDef1);
      expect(iterSpy.mock.calls[2][0]).toEqual(childDef3);
      expect(iterSpy.mock.calls[3][0]).toEqual(childDef2);
    });
  });

  describe(`forEachDefinitionReversed`, () => {
    it(`iterates over all definitions from bottom to the top`, async () => {
      const buildFakeResolver = (): DependencyResolver<any, any> => {
        return { id: Math.random(), build: jest.fn(), onRegister: jest.fn() };
      };

      const childDef1 = ModuleRegistry.empty('def1').extendDeclarations('a1', buildFakeResolver());
      const childDef2 = ModuleRegistry.empty('def2').extendDeclarations('a2', buildFakeResolver());
      const childDef3 = ModuleRegistry.empty('def3')
        .extendDeclarations('a3', buildFakeResolver())
        .extendImports('childDef3', childDef2);

      const def1 = ModuleRegistry.empty('def1')
        .extendImports('childDef1', childDef1)
        .extendImports('childDef2', childDef3);

      const iterSpy = jest.fn();
      def1.forEachDefinitionReversed(iterSpy);

      expect(iterSpy.mock.calls[0][0]).toEqual(childDef2.declarations.get('a2'));
      expect(iterSpy.mock.calls[1][0]).toEqual(childDef3.declarations.get('a3'));
      expect(iterSpy.mock.calls[2][0]).toEqual(childDef1.declarations.get('a1'));
    });
  });

  describe(`forEachDefinition`, () => {
    it(`iterates over all definitions from bottom to the top`, async () => {
      const buildFakeResolver = (): DependencyResolver<any, any> => {
        return { id: Math.random(), build: jest.fn(), onRegister: jest.fn() };
      };

      const childDef1 = ModuleRegistry.empty('def1').extendDeclarations('a1', buildFakeResolver());
      const childDef2 = ModuleRegistry.empty('def2').extendDeclarations('a2', buildFakeResolver());
      const childDef3 = ModuleRegistry.empty('def3')
        .extendDeclarations('a3', buildFakeResolver())
        .extendImports('childDef3', childDef2);

      const def1 = ModuleRegistry.empty('def1')
        .extendImports('childDef1', childDef1)
        .extendImports('childDef2', childDef3);

      const iterSpy = jest.fn();
      def1.forEachDefinition(iterSpy);

      expect(iterSpy.mock.calls[0][0]).toEqual(childDef1.declarations.get('a1'));
      expect(iterSpy.mock.calls[1][0]).toEqual(childDef3.declarations.get('a3'));
      expect(iterSpy.mock.calls[2][0]).toEqual(childDef2.declarations.get('a2'));
    });
  });

  describe(`events`, () => {
    it(`calls onRegister hooks on DependencyResolver`, async () => {
      const resolver: DependencyResolver<any, any> = {
        id: Math.random(),
        build: jest.fn(),
        onRegister: jest.fn(),
      };
      const moduleRegistry = ModuleRegistry.empty('someDefinitionsSet');
      moduleRegistry.extendDeclarations('someKey', resolver);

      expect(resolver.onRegister).toHaveBeenCalledWith(moduleRegistry.events);
    });
  });
});
