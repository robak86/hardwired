import {Point} from "../math/point";
import {Bounds} from "../math/bounds";

export class Immutable {

    // ----- Static properties for functional composition!
    static set<I extends Immutable, K extends keyof I>(key:K, val:I[K], imm:I):I {
        return imm.set(key, val);
    }

    // private frozen:boolean = false;

    // constructor() {
    //     const self = this;
    //     return new Proxy(this, {
    //         set(target, name, value) {
    //             // let setables = ['name', 'email'];
    //             // if (!setables.includes(name)) {
    //             //     throw new Error(`Cannot set the ${name} property`);
    //             // } else {
    //             if (!target.frozen){
    //                 console.log('set', target, name, value);
    //             }
    //
    //             target[name] = value;
    //             return true;
    //         },
    //
    //     });
    //     // Object.freeze(this);
    // }

    // protected setPath() {
    //
    // }

    protected get<K extends keyof this>(key:K):this[K] {
        return this[key];
    }

    protected set<K extends keyof this>(key:K, val:this[K]):this {
        const shallowCloned:this = Object.create(this);
        shallowCloned[key] = val;
        return shallowCloned;
    }

    protected update<K extends keyof this, RET extends this[K]>(key:K, updateFn:(val:this[K]) => RET) {
        this.set(key, updateFn(this[key]));
    }

    protected setter<K extends keyof this>(key:K):(val:this[K]) => this {
        return (val:this[K]) => this.set(key, val);
    }

    protected updater<K extends keyof this, RET extends this[K]>(key:K):(updateFn:(val:this[K]) => RET) => this {
        return (updateFn) => this.set(key, updateFn(this[key]));
    }
}


class View<CH> extends Immutable {
    readonly id!:number;
    readonly position!:Point;
    readonly bounds!:Bounds;
    readonly children!:CH;

    setPosition = this.setter('position');
    updatePosition = this.updater('position');
    setId = this.setter('id');
}

new View()
    .setId(1)
    .setPosition(Point.build(0, 0))
    .updatePosition(() => Point.build(0, 0));



