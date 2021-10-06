import { container } from 'hardwired';
import { selector } from '../selector';
import { state } from '../state';
import { autorun, isComputed, runInAction } from 'mobx';
import { expectType, TypeEqual } from 'ts-expect';

describe(`selector`, () => {
  it(`binds select fn to observables and wraps with computed`, async () => {
    type SomeState = {
      someValue: string;
    };
    const stateD = state({ someValue: 'myValue' });
    const select = (state: SomeState) => state.someValue;

    const selectorD = selector(select, stateD);
    const cnt = container();

    const [_, selectorInstance] = cnt.getAll(stateD, selectorD);
    expect(isComputed(selectorInstance)).toEqual(true);
    expect(selectorInstance.get()).toEqual('myValue');
  });

  it(`creates definition with correct type`, async () => {
    type SomeState = {
      someValue: string;
    };
    const stateD = state({ someValue: 'myValue' });
    const select = (state: SomeState) => state.someValue;

    expectType<TypeEqual<typeof select, (state: SomeState) => string>>(true);
  });

  it(`correctly triggers autorun`, async () => {
    type SomeState = {
      someValue: string;
    };
    const stateD = state({ someValue: 'myValue' });
    const select = (state: SomeState) => state.someValue;

    const selectorD = selector(select, stateD);
    const cnt = container();

    const [stateInstance, selectorInstance] = cnt.getAll(stateD, selectorD);
    const autorunValues: string[] = [];

    autorun(() => {
      autorunValues.push(selectorInstance.get());
    });

    expect(autorunValues).toEqual(['myValue']);
    runInAction(() => (stateInstance.get().someValue = 'newValue'));
    expect(autorunValues).toEqual(['myValue', 'newValue']);

    runInAction(() => (stateInstance.get().someValue = 'newValue'));
    expect(autorunValues).toEqual(['myValue', 'newValue']);
  });

  it(`correctly triggers autorun for multiple states`, async () => {
    type SomeState = {
      someValue: string;
    };

    type OtherState = {
      otherValue: string;
    };
    const state1D = state({ someValue: 'initValue' });
    const state2D = state({ otherValue: 'initValue' });

    const select = (state1: SomeState, state2: OtherState) => [state1.someValue, state2.otherValue] as const;

    const selectorD = selector(select, state1D, state2D);
    const cnt = container();

    const [state1Instance, state2Instance, selectorInstance] = cnt.getAll(state1D, state2D, selectorD);
    const autorunValues: (readonly [string, string])[] = [];

    autorun(() => {
      autorunValues.push(selectorInstance.get());
    });

    expect(autorunValues).toEqual([['initValue', 'initValue']]);
    runInAction(() => (state1Instance.get().someValue = 'newValue'));
    expect(autorunValues).toEqual([
      ['initValue', 'initValue'],
      ['newValue', 'initValue'],
    ]);

    runInAction(() => (state2Instance.get().otherValue = 'newValue'));
    expect(autorunValues).toEqual([
      ['initValue', 'initValue'],
      ['newValue', 'initValue'],
      ['newValue', 'newValue'],
    ]);

    runInAction(() => {
      state1Instance.get().someValue = 'newValue';
      state2Instance.get().otherValue = 'newValue';
    });

    expect(autorunValues).toEqual([
      ['initValue', 'initValue'],
      ['newValue', 'initValue'],
      ['newValue', 'newValue'],
    ]);
  });
});
