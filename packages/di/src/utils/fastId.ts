let c:number = 0;

export function nextId():string {
    return `id_${c += 1}`;
}