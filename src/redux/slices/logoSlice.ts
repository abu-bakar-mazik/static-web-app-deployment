import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
interface LogoResponse {
  url: string;
}
interface CustomError {
  message: string;
}
export const logoApi = createApi({
  reducerPath: 'logoApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
  }),
  tagTypes: ['Logo'],
  endpoints: (builder) => ({
    getLogo: builder.query<LogoResponse, void>({
      query: () => {
        return {
          url: '/getLogo',
          method: 'GET',
        }
      },
      transformResponse: (response: string | LogoResponse) => {
        if (typeof response === 'string') {
          return JSON.parse(response);
        }
        return response;
      },
      transformErrorResponse: (response): CustomError => ({
        message: 'Failed to fetch logo',
      }),
      providesTags: ['Logo']
    })
  }),
});
export const { useGetLogoQuery, useLazyGetLogoQuery } = logoApi;
