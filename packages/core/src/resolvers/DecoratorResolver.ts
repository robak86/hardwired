import { Instance } from './abstract/Instance';
import { ContainerContext } from '../container/ContainerContext';
import { Thunk, unwrapThunk } from '../utils/Thunk';

export class DecoratorResolver<TReturn, TDeps> extends Instance<TReturn, any> {
  usesMaterializedModule = true;

  constructor(
    protected decorated: Thunk<Instance<TReturn, any>>,
    protected decorateFn: <TNew>(original: TReturn, materialized) => TNew,
  ) {
    super();
  }

  build(context: ContainerContext, materializedModule): TReturn {
    return this.decorateFn(unwrapThunk(this.decorated).build(context, materializedModule), materializedModule);
  }
}
