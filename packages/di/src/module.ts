import { BaseModuleBuilder, DefinitionsSet, ModuleRegistry } from '@hardwired/di-core';
import { commonDefines } from './builders/CommonDefines';
import { Module } from '@hardwired/di-core';

export function module<CTX = {}>(name: string) {
  return new Module<{}>(DefinitionsSet.empty(name)).using(commonDefines);

  // TODO: commonDefines could be split into smaller builders (traits like) and module could be composed using enhance
  // return new Module<{}>(DefinitionsSet.empty(name)).applyTrait((registry) => new CommonBuilder(registry));
  // return new Module<{}>(DefinitionsSet.empty(name)).applyTrait(CommonBuilder);
}

export const unit = module;
