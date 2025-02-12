import {IInterceptor} from './interceptor.js';
import {CompositeInterceptor} from './CompositeInterceptor.js';

export class InterceptorsRegistry {
  constructor() {}

  static create() {
    return new InterceptorsRegistry();
  }

  private _interceptors: Record<string | symbol, IInterceptor<unknown>> = {};

  get(id: string | symbol): IInterceptor<unknown> | undefined {
    return this._interceptors[id];
  }

  register(id: string | symbol, interceptor: IInterceptor<unknown>): void {
    if (this._interceptors[id]) {
      throw new Error(`Interceptor with name ${id.toString()} already exists.`);
    }

    this._interceptors[id] = interceptor;
  }

  build(): IInterceptor<any> | undefined {
    const interceptors = Object.values(this._interceptors);

    if (interceptors.length === 1) {
      return interceptors[0];
    }

    if (interceptors.length > 2) {
      return new CompositeInterceptor(interceptors);
    }
  }
}
