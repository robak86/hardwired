import type { IContainerConfigurable } from './abstract/IContainerConfigurable.js';
import type { ContainerConfiguration } from './dsl/new/container/ContainerConfiguration.js';
import { ContainerConfigurationBuilder } from './dsl/new/container/ContainerConfigurationBuilder.js';

export type ContainerConfigureFn = (container: IContainerConfigurable) => void;

export const configureContainer = (configureFn: ContainerConfigureFn): ContainerConfiguration => {
  const builder = new ContainerConfigurationBuilder();

  configureFn(builder);

  return builder.toConfig();
};
