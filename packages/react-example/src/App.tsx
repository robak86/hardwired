import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { CounterStore } from './counter/CounterStore';
import { ContainerProvider, useDefinitions } from 'hardwired-react';
import { counterActionsDef, counterStoreDef } from './app.module';
import { CounterActions } from './counter/CounterActions';

export const Counter: FC<{ store: CounterStore }> = observer(({store}) => {
    return (
        <h2>
            Current value: <span data-testid={'counter-value'}>{store.value}</span>
        </h2>
    );
});

export const CounterButtons: FC<{ actions: CounterActions }> = observer(({actions}) => {
    return (
        <>
            <button onClick={actions.increment}>Increment</button>
            <button onClick={actions.decrement}>Decrement</button>
        </>
    );
});

export const LabeledCounter: FC<{ label: string }> = observer(({label}) => {
    const [store, actions] = useDefinitions([counterStoreDef, counterActionsDef], {counterLabel: label});

    return (
        <div>
            <h1>{label}</h1>
            <Counter store={store}/>
            <CounterButtons actions={actions}/>
        </div>
    );
});

export default () => {
    return (
        <ContainerProvider>
            <LabeledCounter label={'counter 1'}/>
            <LabeledCounter label={'counter 2'}/>
            <LabeledCounter label={'counter 3'}/>
            <LabeledCounter label={'counter 4'}/>
        </ContainerProvider>
    );
};
