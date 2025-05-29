import type { IContainerConfigurable } from './abstract/IContainerConfigurable.js';
import type { IContainerConfiguration } from './dsl/new/container/ContainerConfiguration.js';
import { ContainerConfigurationBuilder } from './dsl/new/container/ContainerConfigurationBuilder.js';

export type ContainerConfigureFn = (container: IContainerConfigurable) => void;

export const configureContainer = (configureFn: ContainerConfigureFn): IContainerConfiguration => {
  const builder = new ContainerConfigurationBuilder();

  configureFn(builder);

  return builder.toConfig();
};
