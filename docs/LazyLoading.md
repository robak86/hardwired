```plantuml
@startuml

package "Some Container" as container1 {
    package "RootModule" as root {
        [Store Definition] as store
        [Child Module Definition] as childModule
    }
}


Package "Some Other Conatiner" as container2 {
    package "Other Root Module" as otherRoot {
        [Store Definition] as otherStore
        [Child Module Definition] as otherChildModule
    }
}


package "Child Module" as child {
    [Selector Definition] as selector
}
note bottom of child: This means that we cannot hold any parent module reference in module definition (or module resolver)

childModule --> child
otherChildModule --> child

@enduml
```

- instantiate `container`
- `container.get(childModule)` - Error, because parent module haven't been loaded yet
- if we store parent reference on a module during creation (`.define('childModule')`) then we may hold references to
modules which even are not required by the container (two containers in single app diagram)
- therefore, in order to use lazy loading we need to manually load (`container.load`) any parent modules ?? 
