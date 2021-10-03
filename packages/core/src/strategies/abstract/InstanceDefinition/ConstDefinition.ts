export type ConstDefinition<T, TMeta = never, TExternal = never> = {
    type: 'const';
    id: string;
    strategy: symbol;
    value: T;
};
