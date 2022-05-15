import { container } from 'hardwired';
import { appClientD } from '../../app.di.js';

describe.skip(`createApp`, () => {
  it(`hello world route`, async () => {
    const cnt = container();
    const fetch = cnt.get(appClientD);

    const response = await fetch('/');
    expect(await response.json()).toEqual({ msg: 'Hello world', id: expect.any(Number) });
  });

  it(`uses isolated request scope`, async () => {
    const cnt = container();
    const fetch = cnt.get(appClientD);

    const response1 = await fetch('/').then(r => r.json() as any);
    const response2 = await fetch('/').then(r => r.json() as any);
    expect(response1.id).not.toEqual(response2.id);
  });

  describe(`posting json body`, () => {
    it(`responds with echoed parsed body`, async () => {
      const cnt = container();
      const fetch = cnt.get(appClientD);
      const response1 = await fetch('/', { method: 'POST', body: JSON.stringify({ inputData: '1234' }) }).then(r =>
        r.json(),
      );
      expect(response1).toEqual('');
    });
  });
});
