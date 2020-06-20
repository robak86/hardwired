- Route object encapsulates queryParam type and route param type
- It can create complete route path with query params
- It encapsulates http method
  - It uses under the hood simpler Route type designed specifically for the frontend
- It can check if route does match
- it optionally can take custom stringify and parse functions for building query params
- should it also bind a payload ? (probably yes, since it )

- Two types
  - QueryRoute = TPath params + TQueryParams
  - CommandRoute = TPath params + TPayloadParams
  - ClientRoute = TPath params + TQueryParams (for client routing) (used internally by QueryRoute ?)

```.env

const usersList = route<{}, UsersListQueryParams>(/users/)



const queryHandler = <TQueryParams, TRouteParams, TInput extends HttpServerContext, TOutput extends HttpResponse>(route: Route<TQueryParams, TCommandParams> , handler:Pipe<TInput, TOutput>): Pipe<TInput, Either<HttpResponse, TOutput>> {
  return handler(ctx => {

        return Either.of(ctx)
            .fold({
                 Left: () => ???
                 Right: () => ???
            })


        if (ctx.route.match(ctx.request.path)){
            return handler.run(ctx);
        } else {
             //TODO: return either left(basic 404 not found?)
        }
  })
}


app.fmap(() => {
   return route
})


```
