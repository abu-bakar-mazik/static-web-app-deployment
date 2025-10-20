import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../lib/customBaseQuery';
import { FileShareFoldersResponse } from '../types';
export const fileShareFoldersApi = createApi({
  reducerPath: 'fileShareFoldersApi',
  baseQuery: customBaseQuery,
  tagTypes: ['FileShareFolders'],
  endpoints: (builder) => ({
    getFileShareFolders: builder.query<FileShareFoldersResponse, { userId: string }>({
      query: ({ userId }) => ({
        url: '/getFileShareFolders',
        method: 'GET',
        headers: {
          'user-id': userId,
        },
      }),
      providesTags: ['FileShareFolders'],
      transformResponse: (response: FileShareFoldersResponse ) => {
        if (!response.folders || !Array.isArray(response.folders)) {
          return {
            success: false,
            folders: [],
            message: 'No folders found',
            totalFolders: 0,
          };
        }
        response.folders.sort((a, b) => {
          if (a.path === '' && b.path !== '') return -1;
          if (a.path !== '' && b.path === '') return 1;
          return a.name.localeCompare(b.name);
        });
        return response;
      },
      keepUnusedDataFor: 300,
    }),
  }),
});
export const {
  useGetFileShareFoldersQuery,
  useLazyGetFileShareFoldersQuery,
} = fileShareFoldersApi;
export default fileShareFoldersApi.reducer;