This basically would be what my prev project reduxed was

## Client side

```
import {usersList, UsersList} from '@myapp/contract';

const usersListResourceL = lens<UsersList>.fromProp('users');
const usersListResource = createQueryResource(usersList);


const {reducer, saga, actions, hooks} = usersListResource;

//actions can be used for writing custom sagas

const {useResource} = hooks;
const {useResourceStatus} = hooks; {isLoading, errors, etc}


```
