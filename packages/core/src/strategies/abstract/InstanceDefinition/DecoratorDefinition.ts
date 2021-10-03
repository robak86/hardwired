import { InstanceDefinition } from "../InstanceDefinition";

export type DecoratorDefinition<T, TMeta = never, TExternal = never> = {
    type: 'decorator';
    id: string;
    strategy: symbol;
    dependencies: any[];
    decorator: (prev: T, ...args: any[]) => T;
    decorated: InstanceDefinition<T>;
};
