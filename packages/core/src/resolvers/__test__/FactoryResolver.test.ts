import { FactoryResolver, Factory } from '../FactoryResolver';
import { ContainerContext } from '../../container/ContainerContext';
import { createResolverId } from '../../utils/fastId';

describe(`FactoryResolver`, () => {
  it(`returns value produced by the factory`, async () => {
    class DummyFactory implements Factory<any> {
      build = jest.fn().mockReturnValue('built by factory');
    }

    const factoryResolver = new FactoryResolver(DummyFactory);
    const context = new ContainerContext();
    const value = factoryResolver.build(context);
    expect(value).toEqual('built by factory');
  });

  it(`does not cache value returned by factory`, async () => {
    class DummyFactory implements Factory<any> {
      build = jest.fn().mockImplementation(createResolverId);
    }

    const factoryResolver = new FactoryResolver(DummyFactory);
    const context = new ContainerContext();
    expect(factoryResolver.build(context)).not.toEqual(factoryResolver.build(context));
  });

  it(`caches factory instance`, async () => {
    const constructorSpy = jest.fn();
    class DummyFactory implements Factory<any> {
      constructor() {
        constructorSpy();
      }
      build = jest.fn().mockImplementation(createResolverId);
    }

    const factoryResolver = new FactoryResolver(DummyFactory);
    const context = new ContainerContext();
    factoryResolver.build(context);
    factoryResolver.build(context);
    expect(constructorSpy).toBeCalledTimes(1);
  });
});
