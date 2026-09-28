import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  CUSTOM_ACCOUNT_FIELDS,
  getCustomFields,
  patchCustomFields,
  patchSettings,
} from './service';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('custom account field service', () => {
  const requestUrl = 'https://lms.example.test/api/custom-reg-form/v1/me/';
  let client;

  beforeEach(() => {
    getConfig.mockReturnValue({ LMS_BASE_URL: 'https://lms.example.test' });
    client = { get: jest.fn(), patch: jest.fn() };
    getAuthenticatedHttpClient.mockReturnValue(client);
  });

  it('gets custom fields through the authenticated custom API and preserves metadata', async () => {
    const response = {
      data: {
        zipcode: '12345',
        metadata: { visibility: { zipcode: 'required' } },
      },
    };
    client.get.mockResolvedValue(response);

    await expect(getCustomFields()).resolves.toEqual(response.data);
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(client.get).toHaveBeenCalledWith(requestUrl);
  });

  it('patches only supported custom fields and preserves the response metadata', async () => {
    const response = {
      data: {
        zipcode: '12345',
        metadata: { visibility: { zipcode: 'required' } },
      },
    };
    client.patch.mockResolvedValue(response);

    await expect(
      patchCustomFields({ zipcode: '12345', username: 'alice' }),
    ).resolves.toEqual(response.data);
    expect(client.patch).toHaveBeenCalledWith(
      requestUrl,
      { zipcode: '12345' },
      { headers: { 'Content-Type': 'application/json' } },
    );
    expect(Object.keys(client.patch.mock.calls[0][1])).toEqual(['zipcode']);
    expect(CUSTOM_ACCOUNT_FIELDS).not.toContain('username');
  });

  it('rejects patches that do not contain exactly one custom field', async () => {
    await expect(patchCustomFields({})).rejects.toThrow(
      'patchCustomFields requires exactly one custom field',
    );
    await expect(patchCustomFields({ zipcode: '12345', ethnicity: 'as' })).rejects.toThrow(
      'patchCustomFields requires exactly one custom field',
    );
    expect(client.patch).not.toHaveBeenCalled();
  });

  it('normalizes array field errors into frontend field error strings', async () => {
    client.patch.mockRejectedValue({
      response: { data: { zipcode: ['Must be a valid zipcode.'] } },
    });

    await expect(patchCustomFields({ zipcode: 'invalid' })).rejects.toMatchObject({
      fieldErrors: { zipcode: 'Must be a valid zipcode.' },
    });
  });

  it('preserves non-field network failures', async () => {
    const networkError = new Error('Network unavailable');
    client.get.mockRejectedValue(networkError);

    await expect(getCustomFields()).rejects.toBe(networkError);
  });

  it('does not send custom fields through the core account API', async () => {
    await expect(patchSettings('alice', { zipcode: '12345' })).resolves.toEqual({});
    expect(client.patch).not.toHaveBeenCalled();
  });
});
