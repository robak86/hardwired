import { getContainer } from "./withContainer.js";
import { InstanceDefinition } from 'hardwired'

export const useDefinition = <T>(def: InstanceDefinition<T, any>): T => {
    return getContainer().get(def)
}
