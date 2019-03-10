```module``` may be in collision with node's module

# TODO: Add callback for dispose ? (e.g for disposing database connection)

# Simple conditional type for asObject

type AppModuleDeps = Materialized<typeof appModule> - currently Materialized requires three params

* add support for factories
```typescript


function somehandler = ({db}) => (req, res, next) => req.send('ok');

module()
.define('uploadMusicScoreHandler', (container) => () => {
    const {db, storage, cookies} = container.checkoutScope().asObject();
    return somehandler({db,storage, cookies});
})

module()
.define('uploadMusicScoreHandler', ({get}) => (req, res, next) => {
    somehandler({db: ext('persistence', 'db'), other: get(someModule, 'someDependency'),req,res})
}, {requestRoot: true})

module()
.define('uploadMusicScoreHandler', ({get}) => handler(someConreteHandler, () => ({db: get(persistenceModule, 'db')})))
}, {requestRoot: true})

.define('handlerFactory', ({db}) => () => handler(db))

module()
.define('uploadMusicScoreHandler', asObject(({db, other}) => someDependency))
.define('uploadMusicScoreHandler', someHandler, [['persistence','db'], ['other'], ['someOther']])

.define('uploadMusicScoreHandler', someHandler, [['persistence', 'db'], {obj: ['other']}])


.define('someDependency', (container) => container.createScope('inherit'|'clean').)
.define('someDependency', asObject(({someDependecny}) => someValue))
.defineUsingContainer('someDependency' => (container) => (req,res) => {
    
    
})


.define('asdfadf', (fn, {arg1, ads}) => () => fn(someFunction, arg1, arg2));



.define('app', createApp)




export function createApp(container):Application {
    const app:Application = express();
    //scores
    app.post('/api/admin/scores/upload', container.uploadMusicScoreHandler);
    app.patch('/api/admin/scores/:id', container.updateMusicScoreHandler);
    return app;
}
```


* passing proxy object is tricky! we are hiding the fact when dependency would be instantiated

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

- container().asObject() - returns proxified object which can be passed as a context to any function


- throw if undefined was returned  





