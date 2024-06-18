import { HttpClient, Api } from 'tonapi-sdk-js';
import {environment} from "../config/environment";

const httpClient: HttpClient = new HttpClient({
  baseUrl: new URL(environment.TONAPI_URL).origin,
  baseApiParams: {
    headers: {
      'Content-type': 'application/json',
      // Authorization: `Bearer ${process.env.NEXT_PUBLIC_TON_API_KEY}`,
    },
  },
});

export const tonApiHttpClient = new Api(httpClient);
