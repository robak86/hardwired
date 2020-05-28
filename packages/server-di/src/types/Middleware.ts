export interface IMiddleware<TInput extends object, TOutput, TFinalType> {
  // processRequest<TRicherInput extends TInput>(input: TRicherInput): (TOutput & TRicherInput) | TFinalType;
  processRequest(input: TInput): TOutput | TFinalType;
  // pipe(input: TInput): (TOutput & TInput) | TFinalType;
}

export interface IHandler<TInput extends object, TFinalType> extends IMiddleware<TInput, never, TFinalType> {}

type MiddlewareSet = {
  <TInput1 extends object, TInput2 extends TInput1, TOutput extends TInput2, TFinal1, TFinal2>(
    middleware: [IMiddleware<TInput1, TInput2, TFinal1>, IMiddleware<TInput2, TOutput, TFinal2>],
  ): IMiddleware<TInput1, TInput2 & TOutput, TFinal1 | TFinal2>;
  (): [];
};
