export type Trait<TOutput, TDependencies> = {
  key?: string;
  dependencies: Trait<any, any>[];
};

type Pipe<TInput> = {
  <TInput2, TOutput2>(fn1: (input: TInput) => TInput2, fn2: (input2: TInput2) => TOutput2): TOutput2;
};

type TraitFn = {
  <TOutput>(): {
    compose: Pipe<Trait<TOutput, {}>>;
  };
};

const trait: TraitFn = null as any;

const using = <TDeps>() => <TOutput, TContext>(tr: Trait<TOutput, TContext>): Trait<TOutput, TContext & TDeps> => {
  throw new Error('Implement me');
};

type TraitOutput = { myk: boolean };
const a = trait<TraitOutput>().compose(using<{ a: 1 }>(), ctx => ctx);
