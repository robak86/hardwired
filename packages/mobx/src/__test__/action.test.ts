import { expectType, TypeEqual } from 'ts-expect';
import { action } from '../action';
import { InstanceDefinition, value } from 'hardwired';

describe(`action test`, () => {
  describe(`action without params`, () => {
    describe(`action without dependencies`, () => {
      it(`creates correct type`, async () => {
        const actionDef = action(() => {});
        expectType<TypeEqual<typeof actionDef, InstanceDefinition<() => void>>>(true);
      });
    });

    describe(`action with dependencies`, () => {
      it(`creates correct type`, async () => {
        const srv = value(123)
        const actionDef = action((someService:number) => {}, srv);
        expectType<TypeEqual<typeof actionDef, InstanceDefinition<() => void>>>(true);
      });
    });
  });

  describe(`action with params`, () => {
    it(`returns correct type`, async () => {
      const actionDef = action((a: number) => {});
      expectType<TypeEqual<typeof actionDef, InstanceDefinition<(a: number) => void>>>(true);
    });
  });
});
