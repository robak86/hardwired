import { InstanceDefinition } from "../InstanceDefinition";

export type DecoratorDefinition<T> = {
    type: 'decorator';
    id: string;
    strategy: symbol;
    dependencies: any[];
    decorator: (prev: T, ...args: any[]) => T;
    decorated: InstanceDefinition<T>;
};
