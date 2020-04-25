type F1 = () => any;

type DefineFunction<TContext> = {
  <TDep1, TResult>(fn: (d1: TDep1) => TResult, depSelect: (ctx: TContext) => [TDep1]): () => TResult;
  <TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: TContext) => [TDep1, TDep2],
  ): () => TResult;
  <TDep1, TDep2, TResult>(fn: (d1: TDep1, d2: TDep2) => TResult, depSelect: (ctx: TContext) => [TDep1]): (
    dep2: TDep2,
  ) => TResult;
};

type DefineClass<TContext> = {
  <TDep1, TResult>(fn: (d1: TDep1) => TResult, depSelect: (ctx: TContext) => [TDep1]): () => TResult;
  <TDep1, TDep2, TResult>(
    fn: (d1: TDep1, d2: TDep2) => TResult,
    depSelect: (ctx: TContext) => [TDep1, TDep2],
  ): () => TResult;
  <TDep1, TDep2, TResult>(fn: (d1: TDep1, d2: TDep2) => TResult, depSelect: (ctx: TContext) => [TDep1]): (
    dep2: TDep2,
  ) => TResult;
};

const define: DefineFunction<{ a: number; b: string }> = null as any;

const method = (a: number, b: string) => 234;

// const curry = define(method, ctx => [ctx.b]);
