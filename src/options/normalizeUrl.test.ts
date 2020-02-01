import { normalizeUrl } from './normalizeUrl';

test("a proper URL shouldn't be mangled", () => {
  expect(normalizeUrl('http://www.google.com')).toEqual(
    'http://www.google.com/',
  );
});

test('missing protocol should default to https', () => {
  expect(normalizeUrl('www.google.com')).toEqual('https://www.google.com/');
});

test("a proper URL shouldn't be mangled", () => {
  expect(() => {
    normalizeUrl('http://ssddfoo bar');
  }).toThrow('Your url "http://ssddfoo bar" is invalid');
});
