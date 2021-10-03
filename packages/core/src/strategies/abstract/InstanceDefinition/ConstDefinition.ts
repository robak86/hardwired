export type ConstDefinition<T> = {
    type: 'const';
    id: string;
    strategy: symbol;
    value: T;
};
