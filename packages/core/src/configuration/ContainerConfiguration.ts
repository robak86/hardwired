import type { IContainerConfigurable } from './abstract/IContainerConfigurable.js';
import type { IConfiguration } from './dsl/new/container/ContainerConfiguration.js';
import { ContainerConfigurationBuilder } from './dsl/new/container/ContainerConfigurationBuilder.js';

export type ContainerConfigureFn = (container: IContainerConfigurable) => void;

export const configureContainer = (configureFn: ContainerConfigureFn): IConfiguration => {
  const builder = new ContainerConfigurationBuilder();

  configureFn(builder);

  return builder.toConfig();
};
