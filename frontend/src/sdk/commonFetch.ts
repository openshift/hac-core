import { HttpError } from './httpError';

const k8sBasePath = `/api/k8s`;

type AuthConfig = {
  getToken: () => Promise<String>;
};

export const validateStatus = async (response: Response) => {
  if (response.ok) {
    return response;
  }

  if (response.status === 401) {
    throw new HttpError('Invalid token. Are you working with Prod SSO token?', response.status, response);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || contentType.indexOf('json') === -1) {
    throw new HttpError(response.statusText, response.status, response);
  }

  if (response.status === 403) {
    return response.json().then((json) => {
      throw new HttpError(json.message || 'Access denied due to cluster policy.', response.status, response, json);
    });
  }

  return response.json().then((json) => {
    const cause = json.details?.causes?.[0];
    let reason;
    if (cause) {
      reason = `Error "${cause.message}" for field "${cause.field}".`;
    }
    if (!reason) {
      reason = json.message;
    }
    if (!reason) {
      reason = json.error;
    }
    if (!reason) {
      reason = response.statusText;
    }

    throw new HttpError(reason, response.status, response, json);
  });
};

export const commonFetch =
  (auth: AuthConfig) =>
  async (url: string, options: RequestInit): Promise<Response> => {
    const token = await auth.getToken();
    if (!token) {
      return Promise.reject('Could not make k8s call. Unable to find token.');
    }

    const allOptions = {
      ...options,
      headers: {
        ...options.headers,
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      let safeURL = url;
      if (/^\/\//.test(url)) {
        // https://github.com/openshift/dynamic-plugin-sdk/pull/55
        safeURL = url.slice(1);
      }
      return validateStatus(await fetch(new Request(`${k8sBasePath}${safeURL}`, { credentials: 'include' }), allOptions));
    } catch (e) {
      return Promise.reject(e);
    }
  };
