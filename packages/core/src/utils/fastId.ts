let moduleId = 0;

export function createModuleId(): string {
  return `mod_${(moduleId += 1)}`;
}

let containerId = 0;
export function createContainerId(): string {
  return `container${(containerId += 1)}`;
}
