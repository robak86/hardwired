import {container, module, withContainer} from "../lib";

type P = { ctxVal1:boolean };

const otherMod = module('z')
    .declare('a1', (c, ctx:P) => 1);

// container(otherMod,{});
const modA = module("a")
    .declare("v1", () => 1)
    .declare("v2", () => 2);

const modB = module("b")
    .import("a", modA)
    .declare("v3", () => 3);

const modC = module("c")
    .import("b", modB)
    .declare("v4", ({b}) => b.v3);


const getV1 = withContainer(modA, 'v1');

const val:string = getV1({});




// modC.checkout({}).get("v4");

// @#$@#$
// modC.checkout({})
//     .deepGet(modB, 'v3');


// modC.checkout({})
//     .deepGet(otherMod, 'a1');