import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '@/redux/lib/customBaseQuery';
import type {
  BatchAutomationJobRequest,
  BatchAutomationJobResponse,
  ListBatchAutomationJobsResponse,
  SelectedPrompt
} from '@/types/batch-automation-types';
export const batchAutomationApi = createApi({
  reducerPath: 'batchAutomationApi',
  baseQuery: customBaseQuery,
  tagTypes: ['BatchAutomationJob', 'BatchAutomationStatus'],
  endpoints: (builder) => ({
    createBatchAutomationJob: builder.mutation<ListBatchAutomationJobsResponse, BatchAutomationJobRequest & { userId: string }>({
      query: ({ userId, ...body }) => ({
        url: '/batchAutomation/createBatchAutomationJob',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body,
      }),
      invalidatesTags: ['BatchAutomationJob'],
      transformResponse: (response: ListBatchAutomationJobsResponse) => {
        if (response.id) {
          console.log(`Batch automation job created successfully: ${response.id}`);
        }
        return response;
      },
      transformErrorResponse: (error: any) => {
        console.log('Failed to create batch automation job:', error);
        return {
          success: false,
          message: error?.data?.message || 'Failed to create batch automation job',
          error: error?.data?.error || 'Unknown error'
        };
      }
    }),
    getBatchAutomationStatus: builder.query<ListBatchAutomationJobsResponse, { batchId: string; userId: string }>({
      query: ({ batchId, userId }) => ({
        url: `/batchAutomation/getBatchAutomationStatus?batch_id=${batchId}`,
        method: 'GET',
        headers: {
          'user-id': userId,
        },
      }),
      providesTags: (result, error, { batchId }) => [{ type: 'BatchAutomationStatus', id: batchId }],
      transformResponse: (response: any) => {
        return response?.data || response;
      },
    }),
    listBatchAutomationJobs: builder.query<ListBatchAutomationJobsResponse, { userId: string }>({
      query: ({ userId }) => ({
        url: `/batchAutomation/listBatchAutomationJobs`,
        method: 'GET',
        headers: {
          'user-id': userId,
        },
      }),
      providesTags: ['BatchAutomationJob'],
    }),
    deleteBatchAutomationJob: builder.mutation<{ success: boolean; message: string }, { batchId: string; userId: string }>({
      query: ({ batchId, userId }) => ({
        url: `/batchAutomation/deleteBatchAutomationJob?batch_id=${batchId}`,
        method: 'DELETE',
        headers: {
          'user-id': userId,
        },
      }),
      invalidatesTags: (_result, _error, { batchId }) => [
        { type: 'BatchAutomationStatus', id: batchId },
        'BatchAutomationJob'
      ],
      transformResponse: (response: any) => {
        return response?.response || response;
      },
    }),
    cloneBatch: builder.mutation<ListBatchAutomationJobsResponse, { title: string, batch_id: string; userId: string; process_type: string; selected_prompts: SelectedPrompt[]; selected_categories: string[]; }
    >({
      query: ({ title, batch_id, userId, process_type, selected_prompts, selected_categories }) => ({
        url: `/batchAutomation/cloneBatch`,
        method: 'POST',
        headers: {
          'user-id': userId,
          'Content-Type': 'application/json',
        },
        body: { title, batch_id, process_type, selected_prompts, selected_categories }
      }),
      invalidatesTags: ['BatchAutomationJob'],
      transformResponse: (response: any) => {
        return response?.response || response;
      },
      transformErrorResponse: (error: any) => {
        console.log('Failed to clone batch:', error);
        return {
          success: false,
          message: error?.data?.detail || error?.data?.message || 'Failed to clone batch',
        };
      }
    }),
    exportBatchResults: builder.mutation<{blob: Blob; filename: string}, { batchId: string; userId: string }>({
      query: ({ batchId, userId }) => ({
        url: `/batchAutomation/exportBatchResults?batch_id=${batchId}`,
        method: 'GET',
        headers: {
          'user-id': userId,
        },
        responseHandler: async (response: Response) => {
          const blob = await response.blob();
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'batch-automation.xlsx';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, '');
            }
          }
          return { blob, filename };
        },
      }),
      transformErrorResponse: (error: any) => {
        console.log('Failed to export batch results:', error);
        return {
          success: false,
          message: error?.data?.message || 'Failed to export batch results',
          error: error?.data?.error || 'Unknown error'
        };
      }
    }),
    updateBatchAutomationStatus: builder.mutation<{ success: boolean; message: string }, { batchId: string; status: string; userId: string }>({
      query: ({ batchId, status, userId }) => ({
        url: `/batchAutomation/updateBatchStatus?batch_id=${batchId}&status=${status}`,
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'user-id': userId,
        },
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: 'BatchAutomationStatus', id: batchId },
        'BatchAutomationJob'
      ],
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      transformErrorResponse: (error: any) => {
        console.log('Failed to update batch automation status:', error);
        return {
          success: false,
          message: error?.data?.detail || error?.data?.message || 'Failed to update batch automation status',
        };
      }
    }),
  }),
});
export const {
  useCreateBatchAutomationJobMutation,
  useGetBatchAutomationStatusQuery,
  useListBatchAutomationJobsQuery,
  useDeleteBatchAutomationJobMutation,
  useCloneBatchMutation,
  useExportBatchResultsMutation,
  useUpdateBatchAutomationStatusMutation
} = batchAutomationApi;
export default batchAutomationApi.reducer;