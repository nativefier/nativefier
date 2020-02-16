import { processOptions } from './fields';

test('fully-defined async options are returned as-is', async () => {
  const options = {
    packager: {
      icon: '/my/icon.png',
      name: 'my beautiful app ',
      targetUrl: 'https://myurl.com',
      dir: '/tmp/myapp',
    },
    nativefier: { userAgent: 'random user agent' },
  };
  // @ts-ignore
  await processOptions(options);

  expect(options.packager.icon).toEqual('/my/icon.png');
  expect(options.packager.name).toEqual('my beautiful app');
  expect(options.nativefier.userAgent).toEqual('random user agent');
});

test('user agent is inferred if not passed', async () => {
  const options = {
    packager: {
      icon: '/my/icon.png',
      name: 'my beautiful app ',
      targetUrl: 'https://myurl.com',
      dir: '/tmp/myapp',
      platform: 'linux',
    },
    nativefier: { userAgent: undefined },
  };
  // @ts-ignore
  await processOptions(options);

  expect(options.nativefier.userAgent).toMatch(/Linux.*Chrome/);
});
