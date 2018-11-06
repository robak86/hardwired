# TODO: Add callback for dispose ? (e.g for disposing database connection)

add support for thunks for import! (circular dependencies)

* enable registering const values
    * builder does not have any external dependency
    * value is cached in module itself (how to integrate it with mocking ?)
    
* enable registering for constAsync()
    * the same 

* make building a container async process which will allow for
    * registering async dependencies
        * they have to be eager loaded
        
        
        
.define(() => Promise.resolve())
.defineAsync(() => Promise.resolve()) //it willy be eagerly loaded during container construction

- how to handle dependencies between two async 



- containerSync() - throws if any of the modules in dependencies tree has registered async dependency
- container()
- container should throw if there is no dependency registered for given label

- container().toObject() - returns proxified object which can be passed as a context to any function


- throw if undefined was returned  





