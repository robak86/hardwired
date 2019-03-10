import {Point} from "../math/point";
import R from 'ramda';

type ImmutableProperty = Record<string, number | string | Immutable<any>>

class Immutable<D extends ImmutableProperty> {

    private data:D;

    protected get(key:keyof this):this {
        return this;
    }

    protected set<K extends keyof D>(key:K, val:D[K]):this {
        const shallowCloned:this = Object.create(this);
        shallowCloned.data = R.assoc(key as any, val) as any;
        return shallowCloned;
    }

    protected setCurried<K extends keyof D>(key:K):(val:D[K]) => this {
        return (val:D[K]) => this;
    }

    protected setter<K extends keyof D>(key:K):(val:D[K]) => this {
        return (val:D[K]) => this;
    }

    //or pipe?!
    update(updater:(obj:D) => D) {

    }
}

type Diff<ALL, DEFAULTS> = {
    [K in keyof ALL]:keyof DEFAULTS extends K ? never : K
}[keyof ALL]

// type MissingFromDefault<ALL, DEFAULTS> = Diff<ALL, DEFAULTS>
type MissingFromDefault<ALL, DEFAULTS> = Pick<ALL, Diff<ALL, DEFAULTS>>


type Mi = MissingFromDefault<{ a:number, b:number }, { a:number }>

const adsfa:Mi = {};


// type Diffed = Diff<{ a:1, b:2 }, { a:1 }>
//
// const z:Diffed = 'q';


//TODO: add type constraint that writers needs to return View Element and (if possible) take view as last argument!
function immutable<T>() {
    return {
        withDefaults<DEF>(def:DEF) {
            return {
                build(params:MissingFromDefault<T, DEF> & Partial<T>):T {
                    return null as any
                },
                mutate(fn:(el:T) => void, el:T):T { //TODO: add currying
                    //TODO: use immer for mutations
                }
            }
        }
    };
}

function immutable2<T>(def:Partial<T>) {
    return {
        build(params:MissingFromDefault<T, typeof def> & Partial<T>):T {
            return null as any
        }
    };
}

type View = {
    readonly id:number;
    readonly position:Point;
}

const View = immutable<View>()
    .withDefaults({id: 1});

View.build({id: 1, position: Point.build(0, 0)});


View.mutate((el) => el.id = 1)



