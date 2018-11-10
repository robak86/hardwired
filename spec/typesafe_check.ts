// import {container, module, withContainer} from "../lib";
//
// type P = { ctxVal1:boolean };
//
// const otherMod = module('z')
//     .define('a1', (c, ctx:P) => 1);
//
//
// type Ctx = {type: string}
//
// // container(otherMod,{});
// const modA = module("a")
//     .define("v1", (_, {type}:Ctx) => 1)
//     .define("v2", ({v1}) => 2);
//
// container(modA,{}).get('v5');
//
// const z = container(modA,{}).get('v1')
//
//
//
//
// const modB = module("b")
//     .import("a", modA)
//     .define("v3", () => 3);
//
// const modC = module("c")
//     .import("b", modB)
//     .define("v4", ({v3}) => b.v3);
//
//
//
// // const modC = module("c")
// //     .import("b", modB)
// //     .define("v4", (container) => b.v3);
//
// container(modA, {})
//
//
// const getV1 = withContainer(modA, 'v1');
//
// const val:string = getV1({});
//
//
//
//
// // modC.checkout({}).get("v4");
//
// // @#$@#$
// // modC.checkout({})
// //     .deepGet(modB, 'v3');
//
//
// // modC.checkout({})
// //     .deepGet(otherMod, 'a1');
