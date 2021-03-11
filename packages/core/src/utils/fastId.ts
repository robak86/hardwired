let c = 0;

export function createModuleId(): string {
  return `mod_${(c += 1)}`;
}
