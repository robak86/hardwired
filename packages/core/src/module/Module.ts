import { ModuleBuilder } from './ModuleBuilder';

export const module = (name: string) => ModuleBuilder.empty(name);
export const unit = module;
