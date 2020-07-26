import { container } from '@hardwired/di';
import { appTestModule } from '../../app';

describe(`dummyTest`, () => {
  function setup() {
    const app = container(appTestModule);

    return app.get('client');
  }

  it(`does request`, async () => {
    const client = setup();
    const response = await client.get('/hello');
    console.log(response);
  });
});
