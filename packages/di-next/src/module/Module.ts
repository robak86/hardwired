import { ModuleBuilder } from '../builders/ModuleBuilder';



export function module<CTX = {}>(name: string) {
  return ModuleBuilder.empty(name);
}

export const unit = module;
