import { BuildStrategy } from './abstract/BuildStrategy';
import { Thunk, unwrapThunk } from '../utils/Thunk';
import { InstancesCache } from '../context/InstancesCache';

export class ApplyResolver<TReturn, TDeps> extends BuildStrategy<TReturn> {
  constructor(protected decorated: Thunk<BuildStrategy<TReturn>>, protected applyFn: (original: TReturn) => any) {
    super();
  }

  build(id: string, context: InstancesCache, resolvers, materializedModule?): TReturn {
    const instance = unwrapThunk(this.decorated).build(id, context, resolvers, materializedModule);
    this.applyFn(instance);

    return instance;
  }
}
