import { unit } from '../../di-core/src/module/Module';

export { ClassRequestScopeResolver } from './resolvers/ClassRequestScopeResolver';
export { ClassSingletonResolver } from './resolvers/ClassSingletonResolver';
export { ClassTransientResolver } from './resolvers/ClassTransientResolver';
export { FunctionResolver } from './resolvers/FunctionResolver';
export { SingletonResolver } from './resolvers/SingletonResolver';
export { TransientResolver } from './resolvers/TransientResolver';

export { unit, module } from './module';

export { container } from '@hardwired/di-core';

export { commonDefines } from './builders/CommonDefines';

import { commonDefines } from './builders/CommonDefines';

class SomeClass {}

const zzz = unit('a') //breakme
  .using2(commonDefines, module =>
    module
      .singleton('a', SomeClass)
      .singleton('b', SomeClass, ctx => [ctx.a])
      .singleton('c', SomeClass)
      .singleton('d', SomeClass)
      .singleton('e', SomeClass)
      .singleton('f', SomeClass),
  )
  .using2(commonDefines, module =>
    module
      .singleton('aa', SomeClass)
      .singleton('ab', SomeClass, ctx => [ctx.b])
      .singleton('ac', SomeClass)
      .singleton('ad', SomeClass)
      .singleton('ae', SomeClass)
      .singleton('af', SomeClass),
  );
