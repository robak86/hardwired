export type HasPromiseMember<T> = true extends (T extends Promise<any> ? true : false) ? true : false;
