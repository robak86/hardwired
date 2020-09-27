### Redux integration

- react.context value used by container should be readonly in order to prevent unnecessary rerenders

```
const App = () => {
    return <Container module={appModule}>
        <Component module={appModule} name={someName} />
    </Container>
}
```

- defining container component on the module definition level wouldn't provide enough flexibility to handle every case (e.g. parametrized selector)??
    - on the other hand exposing container access by hooks make it act like service locator... which may not necessarily be wrong



### redux resource integration ?

`.resource('users', () => buidUsersResource()` - this needs to register underhood the saga

### redux-saga-resource

- consider if createResource shouldn't return also actions object!
