import { HttpClient, Api } from 'tonapi-sdk-js';
import { TONAPI_URL } from './config';

// Configure the HTTP client with your host and token
const httpClient: HttpClient = new HttpClient({
  baseUrl: new URL(TONAPI_URL).origin,
  baseApiParams: {
    headers: {
      'Content-type': 'application/json',
    },
  },
});

export const tonApiClient = new Api(httpClient);
