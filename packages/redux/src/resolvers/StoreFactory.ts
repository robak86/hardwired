import { Instance } from '../../../core/src/resolvers/abstract/Instance';
import { ClassType } from '../../../core/src/utils/ClassType';
import { Factory } from '../../../core/src/resolvers/FactoryResolver';
import { FactoryResolver } from '@hardwired/core';

export class StoreFactoryResolver<TReturn, TDeps extends any[]> extends FactoryResolver<TReturn, TDeps> {}

export function storeFactory<TDeps extends any[], TValue>(
  cls: ClassType<Factory<TValue>, TDeps>,
): Instance<TValue, TDeps> {
  return new StoreFactoryResolver(cls) as any;
}
