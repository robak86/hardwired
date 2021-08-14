import {ModulePatch} from "../module/ModulePatch";

export function getPatchedResolversIds(loadTarget: ModulePatch<any>[]) {
    return loadTarget.flatMap(m => {
        return m.patchedResolvers.values.map(patchedResolver => {
            return patchedResolver.id;
        });
    });
}
