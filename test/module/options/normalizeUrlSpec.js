import chai from 'chai';
import normalizeUrl from '../../../src/options/normalizeUrl';

const assert = chai.assert;
const expect = chai.expect;

describe('Normalize URL', () => {
  describe('given a valid URL without a protocol', () => {
    it('should allow the url', () => {
      assert.equal(normalizeUrl('http://www.google.com'), 'http://www.google.com');
    });
  });

  describe('given a valid URL without a protocol', () => {
    it('should allow the url and prepend the HTTP protocol', () => {
      assert.equal(normalizeUrl('www.google.com'), 'http://www.google.com');
    });
  });

  describe('given an invalid URL', () => {
    it('should throw an exception', () => {
      expect(() => normalizeUrl('http://ssddfoo bar')).to.throw('Your Url: "http://ssddfoo bar" is invalid!');
    });
  });
});
