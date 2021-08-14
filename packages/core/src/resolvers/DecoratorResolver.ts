import { BuildStrategy } from './abstract/BuildStrategy';
import { Thunk, unwrapThunk } from '../utils/Thunk';
import { InstancesCache } from '../context/InstancesCache';

export class DecoratorResolver<TReturn, TDeps> extends BuildStrategy<TReturn> {
  constructor(
    protected decorated: Thunk<BuildStrategy<TReturn>>,
    protected decorateFn: <TNew extends TReturn>(original: TReturn, materialized) => TNew,
  ) {
    super();
  }

  build(id: string, context: InstancesCache, materializedModule?): TReturn {
    return this.decorateFn(unwrapThunk(this.decorated).build(id, context, materializedModule), materializedModule);
  }
}
