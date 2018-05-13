import {module} from "../lib";


const otherMod = module('z')
    .declare('a1', () => 1);

const modA = module("a")
    .declare("v1", () => 1)
    .declare("v2", () => 2);

const modB = module("b")
    .import("a", modA)
    .declare("v3", () => 3);

const modC = module("c")
    .import("b", modB)
    .declare("v4", ({b}) => b.v3);

modC.checkout({}).get("v4");

// @#$@#$
// modC.checkout({})
//     .deepGet(modB, 'v3');


// modC.checkout({})
//     .deepGet(otherMod, 'a1');
