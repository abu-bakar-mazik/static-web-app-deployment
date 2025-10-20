import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  QueryReturnValue
} from '@reduxjs/toolkit/query';
type CustomError = {
  status: 'TIMEOUT_ERROR' | 'FETCH_ERROR';
  error: string;
};
export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  CustomError,
  {}
> = async (args, api, extraOptions) => {
  const fetchQuery = fetchBaseQuery({
    baseUrl: '/api/',
    credentials: 'include',
  });
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error('Request timeout'));
    }, 300000);
  });
  try {
    const result = await Promise.race([
      fetchQuery(args, api, extraOptions),
      timeoutPromise
    ]);
    return result as QueryReturnValue<unknown, CustomError, {}>;
  } catch (error) {
    return {
      error: {
        status: error instanceof Error && error.message === 'Request timeout'
          ? 'TIMEOUT_ERROR'
          : 'FETCH_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
  }
};