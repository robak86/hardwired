let c = 0;

export function createResolverId(): string {
  return `id_${(c += 1)}`;
}
