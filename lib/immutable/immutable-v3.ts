import {Point} from "../math/point";

type ImmutableProperty = Record<string, number | string | Immutable<any>>


//TODO: Treat immutable class as accessor for POJO

class Immutable<D extends ImmutableProperty> {

    private data:D;

    protected get(key:keyof this):this {
        return this;
    }

    protected set<K extends keyof D>(key:K, val:D[K]):this {
        const shallowCloned:this = Object.create(this);

        return this;
    }

    protected setCurried<K extends keyof D>(key:K):(val:D[K]) => this {
        return (val:D[K]) => this;
    }

    protected setter<K extends keyof D>(key:K):(val:D[K]) => this {
        return (val:D[K]) => this;
    }

    private clone():any {
        let cloneObj = new (<any>this.constructor());
        for (let attribute in this) {
            if (typeof this[attribute] === "object") {
                cloneObj[attribute] = this.clone();
            } else {
                cloneObj[attribute] = this[attribute];
            }
        }
        return cloneObj;
    }
}

type ViewData = {
    readonly id:number;
    readonly position:Immutable<Point>;
}

class View extends Immutable<ViewData> {


    updatePosition = this.setter('position');
}