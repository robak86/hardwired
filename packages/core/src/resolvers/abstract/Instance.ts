import { InstanceEvents } from "../../container/InstanceEvents";
import { createResolverId } from "../../utils/fastId";
import { ContainerContext } from "../../container/ContainerContext";
import { ContainerEvents } from "../../container/ContainerEvents";

export namespace Instance {
  export type Unbox<T> = T extends Instance<infer TInstance, any>
    ? TInstance
    : "cannot unwrap instance type from Instance";
}

export abstract class Instance<TValue, TDeps extends any[]> {
  kind: "instanceResolver" = "instanceResolver";
  public readonly events = new InstanceEvents();

  protected constructor(public readonly id: string = createResolverId()) {
  }

  abstract build(context: ContainerContext, deps: TDeps): TValue;

  onInit?(context: ContainerContext): void;
}
