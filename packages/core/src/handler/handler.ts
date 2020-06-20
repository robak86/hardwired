import { HandlerResult } from './HandlerResult';
import { HandlerPipeFn } from './handlerPipe';
import { Reader } from '../reader/reader';
import { HttpResponse } from '@roro/server';
import { v4 as makeId } from 'uuid';
import { SwitchHandlersFn } from './switchHandlers';

export class Handler<TInputContext, TContext, TResponse>
  implements Reader<TInputContext, Promise<HandlerResult<TContext, HttpResponse<TResponse>>>> {
  static pipe: HandlerPipeFn = (...handlers: any[]) => {
    return handlers.reduce((composed, current) => {
      return composed.append(current);
    });
  };

  static switch: SwitchHandlersFn = null as any;

  readonly id: string;
  protected prev?: Handler<any, any, any>;

  constructor(private run: (from: TInputContext) => Promise<HandlerResult<TContext, HttpResponse<TResponse>>>) {
    this.id = makeId();
  }

  protected clone(): this {
    return new Handler(this.run) as any;
  }

  protected append<TNextInputContext, TNextContext, TNextResponse>(
    next: Handler<TNextContext, TNextContext, TNextResponse>,
  ) {
    const composed = next.clone();
    composed.prev = this;
    return composed;
  }

  async get(from: TInputContext): Promise<HandlerResult<TContext, HttpResponse<TResponse>>> {
    const prevValue = this.prev && (await this.prev.get(from));
    if (HandlerResult.isContextPass(prevValue)) {
      return this.run(prevValue.context as any);
    }

    if (HandlerResult.isAbortPass(prevValue)) {
      return prevValue;
    }

    if (HandlerResult.isResponse(prevValue)) {
      return prevValue;
    }

    return this.run(from);
  }
}

export const route = <TInput, TContext, TResponse>(routeDefinition): Handler<TInput, TContext, TResponse> => {
  throw new Error('implement me');
};
