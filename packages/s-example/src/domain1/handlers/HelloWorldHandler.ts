import { ContractRouteDefinition, IHandler, response } from '@roro/s-middleware';
import { HelloWorldParams, HelloWorldResponse } from '../contracts/helloWorldRoute1';

export function paramsParser<TParams extends {}>(contractRouteDefinition: ContractRouteDefinition<TParams, any>) {
  return class {
    run() {
      return 'dummy value' as any;
    }
  };
}

export class HelloWorldHandler implements IHandler<HelloWorldResponse> {
  constructor(private params: HelloWorldParams) {}

  run() {
    return response({ message: 'Hello world', parsedParams: this.params });
  }
}
