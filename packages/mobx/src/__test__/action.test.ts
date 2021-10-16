import { expectType, TypeEqual } from 'ts-expect';
import { action } from '../action';
import { InstanceDefinition, LifeTime, value } from 'hardwired';
import { state } from '../state';
import { IObservableValue } from 'mobx';

describe(`action test`, () => {
  type DummyState = {
    someValue: number;
  };

  const dummyState: InstanceDefinition<IObservableValue<DummyState>, any> = state({ someValue: 123 });

  describe(`action without params`, () => {
    describe(`action without dependencies`, () => {
      it(`creates correct type`, async () => {
        const actionDef = action((state: DummyState) => {}, dummyState);
        expectType<TypeEqual<typeof actionDef, InstanceDefinition<() => void, LifeTime.singleton>>>(true);
      });
    });

    describe(`action with dependencies`, () => {
      it(`creates correct type`, async () => {
        const srv = value(123);
        const actionDef = action((someService: number, state: DummyState) => {}, srv, dummyState);
        expectType<TypeEqual<typeof actionDef, InstanceDefinition<() => void, LifeTime.singleton>>>(true);
      });
    });
  });

  describe(`action with params`, () => {
    it(`returns correct type`, async () => {
      const actionDef = action((a: number) => {});
      expectType<TypeEqual<typeof actionDef, InstanceDefinition<(a: number) => void, LifeTime.singleton>>>(true);
    });

    describe(`action with dependencies`, () => {
      it(`returns correct type`, async () => {
        const srv = value(123);
        const actionDef = action(
          (externalParam: string, someService: number, state: DummyState) => {},
          srv,
          dummyState,
        );
        expectType<
          TypeEqual<typeof actionDef, InstanceDefinition<(externalParam: string) => void, LifeTime.singleton>>
        >(true);
      });
    });
  });
});
