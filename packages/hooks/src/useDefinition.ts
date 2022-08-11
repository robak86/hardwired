import { getContainer } from "./withContainer.js";
import { InstanceDefinition } from 'hardwired'

export const useDefinition = <T>(def: InstanceDefinition<T, any, never>): T => {
    return getContainer().get(def)
}
