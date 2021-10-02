// TODO: add support for injecting deps into applyFn
import { DecoratorDefinition, InstanceDefinition } from "../strategies/abstract/InstanceDefinition";
import { DecoratorStrategy } from "../strategies/DecoratorStrategy";

export const apply = <TInstance, TNextValue extends TInstance>(
    instance: InstanceDefinition<TInstance>,
    applyFn: (prevValue: TInstance) => void,
): DecoratorDefinition<TInstance> => {
    return {
        ...instance,
        type: 'decorator',
        strategy: DecoratorStrategy.type,
        decorator: (value, ...rest: any[]) => {
            applyFn(value);
            return value;
        },
        decorated: instance,
        dependencies: []
    };
};
