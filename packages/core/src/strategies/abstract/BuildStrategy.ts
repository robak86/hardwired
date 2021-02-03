import { Instance } from '../../resolvers/abstract/Instance';

export abstract class BuildStrategy<TValue> extends Instance<TValue> {
  constructor(protected buildFunction: (ctx) => TValue) {
    super();
  }
}
