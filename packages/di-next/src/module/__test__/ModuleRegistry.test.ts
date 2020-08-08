import { ModuleRegistry } from '../ModuleRegistry';
import { DependencyResolver } from '../../resolvers/DependencyResolver';
import { AbstractDependencyResolver } from '../../resolvers/AbstractDependencyResolver';
import { ImportResolver } from '../../resolvers/ImportResolver';

describe(`ModuleRegistry`, () => {
  class Resolver1 extends AbstractDependencyResolver<any, any> {
    constructor(public testId: string) {
      super(testId);
    }
    build(): any {
      return null;
    }

    forEach(iterFn: (resolver: DependencyResolver<any, any>) => any) {}
  }

  class Resolver2 extends AbstractDependencyResolver<any, any> {
    constructor(public testId: string) {
      super(testId);
    }

    build(): any {
      return null;
    }
    forEach(iterFn: (resolver: DependencyResolver<any, any>) => any) {}
  }

  // describe('findResolvers', () => {
  //   it(`returns resolvers of given type`, async () => {
  //     const parent = ModuleRegistry.empty('def3')
  //       .append('childDef1', () => new ImportResolver('someKey', childDef1))
  //       .append('childDef2', () => new ImportResolver('someKey', childDef2))
  //
  //       .append('parentResolver1', new Resolver1('parentResolver1'))
  //       .append('parentResolver2', new Resolver2('parentResolver2'));
  //
  //     const childDef1 = ModuleRegistry.empty('def1')
  //       .append('child1Resolver1', new Resolver1('child1Resolver1'))
  //       .append('child1Resolver2', new Resolver2('child1Resolver2'));
  //
  //     const childDef2 = ModuleRegistry.empty('def2').append('child2Resolver1', new Resolver1('child2Resolver1'));
  //
  //     const resolvers1 = parent.findResolvers(resolver => Resolver1.isConstructorFor(resolver));
  //     const resolvers2 = parent.findResolvers(resolver => Resolver2.isConstructorFor(resolver));
  //
  //     expect(resolvers1.map(r => r.testId)).toEqual(['parentResolver1', 'child1Resolver1', 'child2Resolver1']);
  //     expect(resolvers2.map(r => r.testId)).toEqual(['parentResolver2', 'child1Resolver2']);
  //   });
  // });

  // describe(`findOwningModule`, () => {
  //   it(`returns module holding given resolver`, async () => {
  //     const parentResolver1 = new Resolver1('parentResolver1');
  //     const parentResolver2 = new Resolver2('parentResolver2');
  //     const child1Resolver1 = new Resolver1('child1Resolver1');
  //     const child1Resolver2 = new Resolver2('child1Resolver2');
  //     const child2Resolver1 = new Resolver1('child2Resolver1');
  //
  //     const parent = ModuleRegistry.empty('def3')
  //       .append('childDef1', () => new ImportResolver('someKey', childDef1))
  //       .append('childDef2', () => new ImportResolver('someKey', childDef2))
  //       .append('parentResolver1', parentResolver1)
  //       .append('parentResolver2', parentResolver2);
  //
  //     const childDef1 = ModuleRegistry.empty('def1')
  //       .append('child1Resolver1', child1Resolver1)
  //       .append('child1Resolver2', child1Resolver2);
  //
  //     const childDef2 = ModuleRegistry.empty('def2').append('child2Resolver1', child2Resolver1);
  //
  //     expect(parent.findOwningModule(parentResolver1)).toEqual(parent);
  //     expect(parent.findOwningModule(parentResolver2)).toEqual(parent);
  //
  //     expect(parent.findOwningModule(child1Resolver1)).toEqual(childDef1);
  //     expect(parent.findOwningModule(child1Resolver2)).toEqual(childDef1);
  //     expect(childDef1.findOwningModule(child1Resolver1)).toEqual(childDef1);
  //     expect(childDef1.findOwningModule(child1Resolver2)).toEqual(childDef1);
  //
  //     expect(parent.findOwningModule(child2Resolver1)).toEqual(childDef2);
  //     expect(childDef2.findOwningModule(child2Resolver1)).toEqual(childDef2);
  //   });
  // });

  // describe(`forEachModuleReversed`, () => {
  //   it(`iterates over all imports`, async () => {
  //     const childDef1 = ModuleRegistry.empty('def1');
  //     const childDef2 = ModuleRegistry.empty('def2');
  //     const childDef3 = ModuleRegistry.empty('def3').append('childDef3', () => new ImportResolver('somKey', childDef2));
  //
  //     const def1 = ModuleRegistry.empty('def1')
  //       .append('childDef1', () => new ImportResolver('childDef1', childDef1))
  //       .append('childDef2', () => new ImportResolver('childDef3', childDef3));
  //
  //     const iterSpy = jest.fn();
  //     def1.forEachModuleReversed(iterSpy);
  //     expect(iterSpy).toBeCalledTimes(4);
  //
  //     expect(iterSpy.mock.calls[0][0]).toEqual(childDef2);
  //     expect(iterSpy.mock.calls[1][0]).toEqual(childDef3);
  //     expect(iterSpy.mock.calls[2][0]).toEqual(childDef1);
  //     expect(iterSpy.mock.calls[3][0]).toEqual(def1);
  //   });
  // });

  // describe(`forEachModule`, () => {
  //   it(`iterates over all imports`, async () => {
  //     const childDef1 = ModuleRegistry.empty('def1');
  //     const childDef2 = ModuleRegistry.empty('def2');
  //     const childDef3 = ModuleRegistry.empty('def3').append('childDef3', () => new ImportResolver('somKey', childDef2));
  //
  //     const def1 = ModuleRegistry.empty('def1')
  //       .append('childDef1', () => new ImportResolver('somKey', childDef1))
  //       .append('childDef2', () => new ImportResolver('otherKey', childDef3));
  //
  //     const iterSpy = jest.fn();
  //     def1.forEachModule(iterSpy);
  //     expect(iterSpy).toBeCalledTimes(4);
  //
  //     expect(iterSpy.mock.calls[0][0]).toEqual(def1);
  //     expect(iterSpy.mock.calls[1][0]).toEqual(childDef1);
  //     expect(iterSpy.mock.calls[2][0]).toEqual(childDef3);
  //     expect(iterSpy.mock.calls[3][0]).toEqual(childDef2);
  //   });
  // });

  // describe(`forEachDefinitionReversed`, () => {
  //   it(`iterates over all definitions from bottom to the top`, async () => {
  //     const buildFakeResolver = (): DependencyResolver<any, any> => {
  //       return {
  //         id: Math.random().toString(),
  //         key: Math.random().toString(),
  //         build: jest.fn(),
  //         onRegister: jest.fn(),
  //         forEach: () => null,
  //       };
  //     };
  //
  //     const childDef1 = ModuleRegistry.empty('def1').append('a1', buildFakeResolver());
  //     const childDef2 = ModuleRegistry.empty('def2').append('a2', buildFakeResolver());
  //     const childDef3 = ModuleRegistry.empty('def3')
  //       .append('a3', buildFakeResolver())
  //       .append('childDef3', () => new ImportResolver('childDef2', childDef2));
  //
  //     const def1 = ModuleRegistry.empty('def1')
  //       .append('childDef1', () => new ImportResolver('childDef1', childDef1))
  //       .append('childDef2', () => new ImportResolver('childDef3', childDef3));
  //
  //     const iterSpy = jest.fn();
  //     def1.forEachDefinitionReversed(iterSpy);
  //
  //     expect(iterSpy.mock.calls[0][0]).toEqual(childDef2.resolvers.get('a2'));
  //     expect(iterSpy.mock.calls[1][0]).toEqual(childDef3.resolvers.get('a3'));
  //     expect(iterSpy.mock.calls[2][0]).toEqual(childDef1.resolvers.get('a1'));
  //   });
  // });
  //
  // describe(`forEachDefinition`, () => {
  //   it(`iterates over all definitions from bottom to the top`, async () => {
  //     const buildFakeResolver = (): DependencyResolver<any, any> => {
  //       return {
  //         id: Math.random().toString(),
  //         key: Math.random().toString(),
  //         build: jest.fn(),
  //         onRegister: jest.fn(),
  //         forEach: () => null,
  //       };
  //     };
  //
  //     const childDef1 = ModuleRegistry.empty('def1').append('a1', buildFakeResolver());
  //     const childDef2 = ModuleRegistry.empty('def2').append('a2', buildFakeResolver());
  //     const childDef3 = ModuleRegistry.empty('def3')
  //       .append('a3', buildFakeResolver())
  //       .append('childDef3', () => new ImportResolver('childDef2', childDef2));
  //
  //     const def1 = ModuleRegistry.empty('def1')
  //       .append('childDef1', () => new ImportResolver('childDef1', childDef1))
  //       .append('childDef2', () => new ImportResolver('childDef3', childDef3));
  //
  //     const iterSpy = jest.fn();
  //     def1.forEachDefinition(iterSpy);
  //
  //     expect(iterSpy.mock.calls[0][0]).toEqual(childDef1.resolvers.get('a1'));
  //     expect(iterSpy.mock.calls[1][0]).toEqual(childDef3.resolvers.get('a3'));
  //     expect(iterSpy.mock.calls[2][0]).toEqual(childDef2.resolvers.get('a2'));
  //   });
  // });

  // describe(`events`, () => {
  //   it(`calls onRegister hooks on DependencyResolver`, async () => {
  //     const resolver: DependencyResolver<any, any> = {
  //       id: Math.random(),
  //       build: jest.fn(),
  //       onRegister: jest.fn(),
  //     };
  //     const moduleRegistry = ModuleRegistry.empty('someDefinitionsSet');
  //     moduleRegistry.append('someKey', resolver);
  //
  //     expect(resolver.onRegister).toHaveBeenCalledWith(moduleRegistry.events);
  //   });
  // });
});
