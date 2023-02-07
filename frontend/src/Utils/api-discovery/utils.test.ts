import { mergeByKey, getReference, kindToAbbr, pluralizeKind } from './utils';

describe('kindToAbbr', () => {
  test('should strip all small characters', () => {
    const value = kindToAbbr('AfoobarBbazCD');
    expect(value).toBe('ABCD');
  });
  test('should strip all small characters and return as upper case', () => {
    const value = kindToAbbr('foobar');
    expect(value).toBe('FOOB');
  });
  test('should not use disallowed kind', () => {
    const value = kindToAbbr('ASS');
    expect(value).toBe('AS');
  });
});

describe('pluralizeKind', () => {
  test('should pluralize', () => {
    const value = pluralizeKind('foo');
    expect(value).toBe('Foos');
  });

  test('should pluralize last string', () => {
    const value = pluralizeKind('foo bar baz');
    expect(value).toBe('FooBarBazs');
  });

  test('should NOT pluralize', () => {
    const value = pluralizeKind('DB');
    expect(value).toBe('DBs');
  });
});

describe('getReference', () => {
  test('should join correctly', () => {
    const value = getReference({ group: 'foo', version: 'bar', kind: 'baz' });
    expect(value).toBe('foo~bar~baz');
  });
  test('should return core reference if empty group', () => {
    const value = getReference({ group: '', version: 'bar', kind: 'baz' });
    expect(value).toBe('core~bar~baz');
  });
  test('should return core reference if no group given', () => {
    const value = getReference({ version: 'bar', kind: 'baz' });
    expect(value).toBe('core~bar~baz');
  });
});

describe('mergeByKey', () => {
  const defaultModel = { apiGroup: 'foo', apiVersion: 'bar', kind: 'baz', plural: 'foo' };
  test('should join same model into one', () => {
    const value = mergeByKey([defaultModel], [defaultModel]);
    expect(value).toStrictEqual([defaultModel]);
  });
  test('should join same model with different plural into one', () => {
    const value = mergeByKey([defaultModel], [{ ...defaultModel, plural: 'bar' }]);
    expect(value).toStrictEqual([defaultModel]);
  });
  test('should not join different models', () => {
    const value = mergeByKey([defaultModel], [{ apiVersion: 'foo', kind: 'bar', plural: 'baz' }]);
    expect(value).toStrictEqual([defaultModel, { apiVersion: 'foo', kind: 'bar', plural: 'baz' }]);
  });
});
