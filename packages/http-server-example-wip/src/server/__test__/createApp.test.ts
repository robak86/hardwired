import { container } from 'hardwired';
import { appClientD } from '../../app.di';

describe(`createApp`, () => {
  it(`hello world route`, async () => {
    const cnt = container();
    const fetch = cnt.get(appClientD);

    const response = await fetch('/');
    expect(await response.json()).toEqual({ msg: 'Hello world' });
  });
});
