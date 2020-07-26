import 'source-map-support/register';

import { container } from '@hardwired/di';
import { appModule, appTestModule } from './app';

// TODO: maybe .using(serverDefinitions) should create implicitly and router ?
// TODO: maybe .using(serverDefinitions) should create implicitly and errorHandler ?
// TODO: having onChildDefinition, onOwnDefinition events would be helpful for precisely registering the handlers ?

// TODO: implement builder.middleware and builder.

const c = container(appModule);

c.get('server').listen();

// const c = container(appTestModule);
// c.get('server').listen();
//
// c.get('client');
