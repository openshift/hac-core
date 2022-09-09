/* eslint-disable no-console */
import { getActivePlugins } from './plugins';
import fetch from 'jest-fetch-mock';

describe('getActivePlugins function tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
    fetch.resetMocks();
  });

  afterEach(() => {
    fetch.resetMocks();
  });

  test('should catch and log error if response is not of type application/json', async () => {
    fetch.mockResponseOnce('text', { headers: { 'content-type': 'application/text' } });
    const result = await getActivePlugins(true, 'foobar');
    expect(result).toMatchObject([]);
    expect(console.error).toHaveBeenCalledWith('Failed to fetch plugin data', new Error('plugin data response is not type application/json'));
  });

  test('should catch and log error if fetch fails', async () => {
    const error = new Error('An unexpected error has occured');
    fetch.mockRejectOnce(error);
    const result = await getActivePlugins(true, 'foobar');
    expect(result).toMatchObject([]);
    expect(console.error).toHaveBeenCalledWith('Failed to fetch plugin data', error);
  });

  test('should return list of plugins on success', async () => {
    const plugins = [{ name: 'cool-plugin' }];
    fetch.mockResponseOnce(JSON.stringify(plugins), { headers: { 'content-type': 'application/json' } });
    const result = await getActivePlugins(true, 'foobar');
    expect(console.error).not.toHaveBeenCalled();
    expect(result).toMatchObject(plugins);
  });

  test('should toggle /beta in URL with isBeta param', async () => {
    const plugins = [{ name: 'cool-plugin' }];
    const appName = 'foobar';
    fetch.mockResponse(JSON.stringify(plugins), { headers: { 'content-type': 'application/json' } });
    await getActivePlugins(false, appName);
    expect(console.error).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(`/apps/${appName}/plugins.json`);
    await getActivePlugins(true, appName);
    expect(console.error).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(`/beta/apps/${appName}/plugins.json`);
  });
});
