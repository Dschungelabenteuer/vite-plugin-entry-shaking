import { describe, it, expect } from 'vitest';
import { addSourceQuerySuffix, parseId } from '../src/urls';

describe('addSourceQuerySuffix', () => {
  it('should add source query suffix to simple url', () => {
    const input = 'e:/path/to/file.ext';
    const expected = 'e:/path/to/file.ext?source=1';
    expect(addSourceQuerySuffix(input)).toStrictEqual(expected);
  });

  it('should add source to existing list of query suffixes', () => {
    const input = 'e:/path/to/file.ext?foo=bar&baz=qux';
    const expected = 'e:/path/to/file.ext?foo=bar&baz=qux&source=1';
    expect(addSourceQuerySuffix(input)).toStrictEqual(expected);
  });
});

describe('parseId', () => {
  const testParseId = (cleanUrl: string, urlWithSource: string) => {
    it('should correctly parse (with source)', () => {
      const input = urlWithSource;
      const expected = { url: cleanUrl, serveSource: true };
      expect(parseId(input)).toStrictEqual(expected);
    });

    it('should correctly parse (without source)', () => {
      const input = cleanUrl;
      const expected = { url: cleanUrl, serveSource: false };
      expect(parseId(input)).toStrictEqual(expected);
    });
  };

  describe('Simple URLs', () => {
    testParseId('e:/path/to/file.ext', 'e:/path/to/file.ext?source=1');
  });

  describe('URLs with query suffixes', () => {
    testParseId(
      'e:/path/to/file.ext?foo=bar&baz=qux',
      'e:/path/to/file.ext?foo=bar&source=1&baz=qux',
    );
  });
});
