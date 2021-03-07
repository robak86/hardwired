import { Instance } from './abstract/Instance';
import { Thunk, unwrapThunk } from '../utils/Thunk';
import { ContextRecord } from '../container/ContainerContextStorage';

export class DecoratorResolver<TReturn, TDeps> extends Instance<TReturn> {
  constructor(
    protected decorated: Thunk<Instance<TReturn>>,
    protected decorateFn: <TNew extends TReturn>(original: TReturn, materialized) => TNew,
  ) {
    super();
  }

  build(id: string, context: ContextRecord, materializedModule): TReturn {
    return this.decorateFn(unwrapThunk(this.decorated).build(id, context, materializedModule), materializedModule);
  }
}
