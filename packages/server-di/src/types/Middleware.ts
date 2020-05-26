export interface IMiddleware<TInput, TOutput extends TInput, TFinalType> {
    processRequest(input: TInput): TOutput | TFinalType;
}

export interface IHandler<TInput, TFinalType> extends IMiddleware<TInput, never, TFinalType> {}

type MiddlewareSet = {
    <TInput1, TInput2 extends TInput1, TOutput extends TInput2, TFinal1, TFinal2>(
        middleware: [IMiddleware<TInput1, TInput2, TFinal1>, IMiddleware<TInput2, TOutput, TFinal2>],
    ): IMiddleware<TInput1, TInput2 & TOutput, TFinal1 | TFinal2>;
    (): [];
};

