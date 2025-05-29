import { cascading, singleton } from '../../definitions/tokens.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import { BindingsRegistry } from '../BindingsRegistry.js';
import { ContainerConfigurationBuilder } from '../../configuration/dsl/new/container/ContainerConfigurationBuilder.js';

describe(`BindingsRegistry`, () => {
  const def1 = singleton<number>('def');
  const def2 = cascading<number>('def');

  describe(`definitions`, () => {
    it(`correctly applies configurations`, async () => {
      const config1 = configureContainer(c => {
        c.add(def1).static(1);
      });

      const configBuilder1 = new ContainerConfigurationBuilder();

      config1(configBuilder1);

      const config2 = configureContainer(c => {
        c.add(def2).static(2);
      });

      const configBuilder2 = new ContainerConfigurationBuilder();

      config2(configBuilder2);

      const registry = BindingsRegistry.create([configBuilder1.toConfig(), configBuilder2.toConfig()]);

      expect(registry.getByToken(def1).id).toEqual(def1.id);
      expect(registry.getByToken(def2).id).toEqual(def2.id);
    });
  });
});
