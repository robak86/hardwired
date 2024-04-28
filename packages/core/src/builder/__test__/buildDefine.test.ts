import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { expectType, TypeOf } from 'ts-expect';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';
import { describe } from 'vitest';
import { container } from '../../container/Container.js';

// describe(`buildDefine`, () => {
//   describe(`types`, () => {
//     it(`sets correct lifetime for a generic type`, async () => {
//       const singleton = buildDefine({ lifeTime: LifeTime.singleton });
//       const someDef = singleton(() => 123);
//       expectType<TypeOf<typeof someDef, InstanceDefinition<number, LifeTime.singleton, unknown>>>(true);
//     });
//
//     it(`sets correct lifetime for a generic type`, async () => {
//       const singleton = buildDefine({ lifeTime: LifeTime.transient });
//       const someDef = singleton(() => 123);
//       expectType<TypeOf<typeof someDef, InstanceDefinition<number, LifeTime.transient, unknown>>>(true);
//     });
//
//     it(`sets correct type for the meta generic type `, async () => {
//       const singleton = buildDefine({
//         lifeTime: LifeTime.transient,
//         buildMeta: (type: string) => {
//           return {
//             type,
//             kind: 'action' as const,
//           };
//         },
//       });
//       const someDef = singleton('my-singleton', () => 123);
//       expectType<
//         TypeOf<typeof someDef, InstanceDefinition<number, LifeTime.transient, { type: string; kind: 'action' }>>
//       >(true);
//     });
//
//     it(`sets dummy types that can be extracted`, async () => {
//       type Meta<TSuccess, TError> = {
//         type: string;
//         kind: 'action';
//         success: TSuccess;
//         error: TError;
//       };
//       const singleton = <TSuccess, TError>() => {
//         return {
//           define: buildDefine({
//             lifeTime: LifeTime.transient,
//             buildMeta: (type: string): Meta<TSuccess, TError> => {
//               return {
//                 type,
//                 kind: 'action' as const,
//               } as Meta<TSuccess, TError>;
//             },
//           }),
//         };
//       };
//
//       const def = singleton<number, string>().define('my-single,ton', () => {
//         return 123;
//       });
//
//       expectType<
//         TypeOf<
//           typeof def,
//           InstanceDefinition<
//             number,
//             LifeTime.transient,
//             { type: string; kind: 'action'; success: number; error: string }
//           >
//         >
//       >(true);
//     });
//   });
//
//   describe('instantiation', () => {
//     it(`creates correct instance`, async () => {
//       const singleton = buildDefine({ lifeTime: LifeTime.singleton });
//       const someDependency = singleton(() => 999);
//       const someDef = singleton(({ use }) => use(someDependency) + 1);
//       expect(container().use(someDef)).toBe(1000);
//     });
//
//     it(`creates correct instance for async definitions`, async () => {
//       const singleton = buildDefine({ lifeTime: LifeTime.singleton });
//       const someDependency = singleton(async () => 999);
//       const someDef = singleton(async ({ use }) => (await use(someDependency)) + 1);
//       expect(await container().use(someDef)).toBe(1000);
//     });
//   });
//
//   describe(`buildMeta`, () => {
//     it(`is called and the output is set as meta`, async () => {
//       const buildMetaSpy = vi.fn((type: string) => {
//         return {
//           type,
//           kind: 'action' as const,
//         };
//       });
//
//       const singleton = buildDefine({
//         lifeTime: LifeTime.transient,
//         buildMeta: buildMetaSpy,
//       });
//
//       const def = singleton('meta', () => 123);
//       expect(def.meta).toEqual({ type: 'meta', kind: 'action' });
//     });
//   });
//
//   describe(`after callback`, () => {
//     it(`calls after callback with newly create instance `, async () => {
//       const afterSpy = vi.fn(val => val + 200);
//       const singleton = buildDefine({
//         lifeTime: LifeTime.singleton,
//         after: afterSpy,
//         buildMeta() {
//           return { metaProp: true };
//         },
//       });
//
//       const def = singleton(() => 123);
//       const instance = container().use(def);
//       expect(afterSpy).toHaveBeenCalledWith(123, { metaProp: true });
//       expect(instance).toBe(323);
//     });
//   });
//
//   describe(`include`, () => {
//     it(`adds given dependencies to the context`, async () => {
//       const singleton = buildDefine({ lifeTime: LifeTime.singleton });
//
//       const includedDef = singleton(() => 123);
//
//       const action = buildDefine({
//         lifeTime: LifeTime.singleton,
//         include: {
//           includedDef,
//         },
//       });
//
//       const targetDef = action(({ use, includedDef }) => {
//         return includedDef + 1;
//       });
//
//       const instance = container().use(targetDef);
//       expect(instance).toBe(124);
//     });
//   });
// });
