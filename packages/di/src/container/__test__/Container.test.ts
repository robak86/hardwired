import { module } from '../../module/Module';
import { ModuleBuilder } from '../../builders/ModuleBuilder';
import { Definition, RequiresDefinition } from '../../module/ModuleRegistry';
import { container, DeepGetReturnErrorMessage } from '../Container';
import { expectType, TypeEqual } from 'ts-expect';
import { lifecycle } from '../../builders/LifeCycle';
import { imports } from '../../builders/ImportsBuilder';
import { singleton } from '../../builders/SingletonBuilder';

describe(`Container`, () => {
  describe(`.deepGet`, () => {
    describe(`types`, () => {
      it(`checks if module passed as an argument is compatible with container externals`, async () => {
        const m1: ModuleBuilder<{ external: RequiresDefinition<{ a: number }>; own: Definition<number> }> = module(
          '',
        ) as any;
        const m2: ModuleBuilder<{ other: Definition<number> }> = module('') as any;
        const m3: ModuleBuilder<{
          otherExternal: RequiresDefinition<{ a: number }>;
          other: Definition<number>;
        }> = module('') as any;

        const c = container(m1);
        (c as any).deepGet = () => null;
        const result = c.deepGet(m1, 'own');
        const result2 = c.deepGet(m2, 'other');
        const error = c.deepGet(m3, 'other');

        expectType<TypeEqual<typeof result, number>>(true);
        expectType<TypeEqual<typeof result2, number>>(true);
        expectType<TypeEqual<typeof error, DeepGetReturnErrorMessage>>(true);
      });
    });
  });

  describe(`lifecycles`, () => {
    it(`starts initialization from leaf modules`, async () => {});

    it(`calls all initializer from all registered modules`, async () => {
      const m1InitSpy = jest.fn();
      const m1 = module('m1').using(lifecycle()).onInit(m1InitSpy);

      const m2InitSpy = jest.fn();
      const m2 = module('m2').using(lifecycle()).onInit(m2InitSpy);

      const parentInitSpy = jest.fn();
      const parent = module('parent') // breakme
        .using(lifecycle())
        .onInit(parentInitSpy)
        .using(imports)
        .import('m1', m1)
        .import('m2', m2);

      const c = container(parent);
      c.init();

      expect(m1InitSpy).toBeCalledTimes(1);
      expect(m2InitSpy).toBeCalledTimes(1);
      expect(parentInitSpy).toBeCalledTimes(1);
    });

    it(`does not call initializers for modules already initialized`, async () => {
      const sharedInitSpy = jest.fn();
      const shared = module('shared').using(lifecycle()).onInit(sharedInitSpy);

      const m1InitSpy = jest.fn();
      const m1 = module('m1') // breakme
        .using(imports)
        .import('sh', shared)
        .using(lifecycle())
        .onInit(m1InitSpy);

      const m2InitSpy = jest.fn();
      const m2 = module('m2') // breakme
        .using(imports)
        .import('sh', shared)
        .using(lifecycle())
        .onInit(m2InitSpy);

      const parentInitSpy = jest.fn();
      const parent = module('parent') // breakme
        .using(lifecycle())
        .onInit(parentInitSpy)
        .using(imports)
        .import('m1', m1)
        .import('m2', m2);

      const c = container(parent);
      c.init();

      expect(m1InitSpy).toBeCalledTimes(1);
      expect(m2InitSpy).toBeCalledTimes(1);
      expect(parentInitSpy).toBeCalledTimes(1);
      expect(sharedInitSpy).toBeCalledTimes(1);
    });

    it(`initialize module on deepGet call`, async () => {
      const m1InitSpy = jest.fn();
      const m1 = module('m1').using(lifecycle()).onInit(m1InitSpy);

      const m2InitSpy = jest.fn();
      const m2 = module('m2')
        .using(singleton)
        .define('a', () => 123)
        .using(lifecycle())
        .onInit(m2InitSpy);

      const c = container(m1);
      c.init();

      expect(m2InitSpy).not.toBeCalled();
      c.deepGet(m2, 'a');

      expect(m2InitSpy).toBeCalled();
    });
  });
});