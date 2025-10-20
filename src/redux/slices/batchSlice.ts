// api/batchApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../lib/customBaseQuery';
import { createSlice } from '@reduxjs/toolkit';
export interface DeleteByIdResponse {
  message: string;
  DeletedBatchId: string;
}
interface CustomError {
  status: 'TIMEOUT_ERROR' | 'FETCH_ERROR';
  error: string;
}
export interface DeleteBatchError {
  error: string;
  details: string;
}
interface BatchState {
  isLoading: boolean;
  error: string | null;
}
const initialState: BatchState = {
  isLoading: false,
  error: null
};
export const batchApi = createApi({
  reducerPath: 'batchApi',
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    deleteBatchById: builder.mutation<DeleteByIdResponse, { userId: string | null; batchId: string }>({
      query: ({ userId, batchId }) => ({
        url: '/deleteBatchById',
        method: 'DELETE',
        headers: {
          'user-id': userId || '',
          'batch-id': batchId,
        },
      }),
      // Transform any errors into a consistent format
      transformErrorResponse: (error: CustomError) => ({
        status: error.status,
        message: error.error
      })
    }),
  }),
});
// Export the auto-generated hook for use in components
export const { useDeleteBatchByIdMutation } = batchApi;

const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(batchApi.endpoints.deleteBatchById.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(batchApi.endpoints.deleteBatchById.matchFulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addMatcher(batchApi.endpoints.deleteBatchById.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while deleting the batch';
      })
  }
})
export default batchSlice.reducer;