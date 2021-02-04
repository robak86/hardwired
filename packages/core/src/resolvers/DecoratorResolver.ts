import { Instance } from './abstract/Instance';
import { ContainerContext } from '../container/ContainerContext';
import { Thunk, unwrapThunk } from '../utils/Thunk';

export class DecoratorResolver<TReturn, TDeps> extends Instance<TReturn> {
  constructor(
    protected decorated: Thunk<Instance<TReturn>>,
    protected decorateFn: <TNew extends TReturn>(original: TReturn, materialized) => TNew,
  ) {
    super()
  }

  build(id: string, context: ContainerContext, materializedModule): TReturn {
    return this.decorateFn(unwrapThunk(this.decorated).build(id, context, materializedModule), materializedModule);
  }
}
