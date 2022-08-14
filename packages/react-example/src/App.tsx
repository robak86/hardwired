import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { CounterStore } from './counter/CounterStore.js';
import { ContainerProvider, ContainerScope, useDefinitions } from 'hardwired-react';
import { counterActionsDef, counterLabelValueDef, counterStoreDef } from './app.module.js';
import { CounterActions } from './counter/CounterActions.js';
import { set } from 'hardwired';

export const Counter: FC<{ store: CounterStore }> = observer(({ store }) => {
  return (
    <h2>
      Current value: <span data-testid={'counter-value'}>{store.value}</span>
    </h2>
  );
});

export const CounterButtons: FC<{ actions: CounterActions }> = observer(({ actions }) => {
  return (
    <>
      <button onClick={actions.increment}>Increment</button>
      <button onClick={actions.decrement}>Decrement</button>
    </>
  );
});

export const CounterFooter: FC = observer(() => {
  const [label] = useDefinitions([counterLabelValueDef]);
  return <code>{label}</code>;
});

export const LabeledCounter: FC = observer(() => {
  const [store, actions, label] = useDefinitions([counterStoreDef, counterActionsDef, counterLabelValueDef]);

  return (
    <div>
      <h1>{label}</h1>
      <Counter store={store} />
      <CounterButtons actions={actions} />
      <br />
      <CounterFooter />
    </div>
  );
});

export default () => {
  return (
    <ContainerProvider>
      <ContainerScope scopeOverrides={[set(counterLabelValueDef, 'counter 1')]}>
        <LabeledCounter />
      </ContainerScope>
      <ContainerScope scopeOverrides={[set(counterLabelValueDef, 'counter 2')]}>
        <LabeledCounter />
      </ContainerScope>
      <ContainerScope scopeOverrides={[set(counterLabelValueDef, 'counter 3')]}>
        <LabeledCounter />
      </ContainerScope>
      <ContainerScope scopeOverrides={[set(counterLabelValueDef, 'counter 4')]}>
        <LabeledCounter />
      </ContainerScope>
    </ContainerProvider>
  );
};
