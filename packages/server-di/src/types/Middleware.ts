export type HttpRequest = {
  request: string;
};

export interface IMiddleware<TOutput> {
  run(): TOutput | Promise<TOutput>;
}

export type ContainerHandler<TReturn> = {
  request(request: HttpRequest): TReturn | Promise<TReturn>;
  pathDefinition: string;
};

