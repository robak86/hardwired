import { factory, Factory, FactoryResolver } from '../FactoryResolver';
import { ContainerContext } from '../../container/ContainerContext';
import { createResolverId } from '../../utils/fastId';
import { expectType, TypeEqual } from 'ts-expect';
import { Instance, Scope } from '../abstract/Instance';

describe(`FactoryResolver`, () => {
  describe(`factory`, () => {
    it(`return Instance type`, async () => {
      class DummyFactory implements Factory<number> {
        build() {
          return 1;
        }
        constructor(private a: string) {}
      }

      const s = factory(DummyFactory);
      expectType<TypeEqual<typeof s, Instance<number, [string]>>>(true);
    });
  });

  describe(`singleton scope`, () => {
    it(`returns value produced by the factory`, async () => {
      class DummyFactory implements Factory<any> {
        build = jest.fn().mockReturnValue('built by factory');
      }

      const factoryResolver = new FactoryResolver(DummyFactory, Scope.singleton);
      const context = ContainerContext.empty();
      context.setDependencies(factoryResolver.id, []);
      const value = factoryResolver.build(context);
      expect(value).toEqual('built by factory');
    });

    it(`cache value returned by factory`, async () => {
      class DummyFactory implements Factory<any> {
        build = jest.fn().mockImplementation(createResolverId);
      }

      const factoryResolver = new FactoryResolver(DummyFactory, Scope.singleton);
      const context = ContainerContext.empty();
      context.setDependencies(factoryResolver.id, []);
      expect(factoryResolver.build(context)).toEqual(factoryResolver.build(context));
    });

    it(`caches factory instance`, async () => {
      const constructorSpy = jest.fn();
      class DummyFactory implements Factory<any> {
        constructor() {
          constructorSpy();
        }
        build = jest.fn().mockImplementation(createResolverId);
      }

      const factoryResolver = new FactoryResolver(DummyFactory, Scope.singleton);
      const context = ContainerContext.empty();
      context.setDependencies(factoryResolver.id, []);

      factoryResolver.build(context);
      factoryResolver.build(context);
      expect(constructorSpy).toBeCalledTimes(1);
    });
  });

  describe(`transient scope`, () => {
    it(`returns value produced by the factory`, async () => {
      class DummyFactory implements Factory<any> {
        build = jest.fn().mockReturnValue('built by factory');
      }

      const factoryResolver = new FactoryResolver(DummyFactory, Scope.transient);
      const context = ContainerContext.empty();
      context.setDependencies(factoryResolver.id, []);
      const value = factoryResolver.build(context);
      expect(value).toEqual('built by factory');
    });

    it(`returns new value on each call`, async () => {
      class DummyFactory implements Factory<any> {
        build = jest.fn().mockImplementation(createResolverId);
      }

      const factoryResolver = new FactoryResolver(DummyFactory, Scope.transient);
      const context = ContainerContext.empty();
      context.setDependencies(factoryResolver.id, []);
      expect(factoryResolver.build(context)).not.toEqual(factoryResolver.build(context));
    });

    it(`calls build on each request`, async () => {
      const constructorSpy = jest.fn();
      class DummyFactory implements Factory<any> {
        constructor() {
          constructorSpy();
        }
        build = jest.fn().mockImplementation(createResolverId);
      }

      const factoryResolver = new FactoryResolver(DummyFactory, Scope.transient);
      const context = ContainerContext.empty();
      context.setDependencies(factoryResolver.id, []);

      factoryResolver.build(context);
      factoryResolver.build(context);
      expect(constructorSpy).toBeCalledTimes(2);
    });
  });
});
