import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '@/redux/lib/customBaseQuery';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminState, ApiUser, ChunkSizeResponse, CustomError, DeleteLogsParams, DeleteLogsResponse, FetchLogsRequest, FormErrors, LogEntry, LogoResponse, LogsResponse, LogsTokenSummary, ModelsResponse, RetrieverStatusResponse, SearchUsersResponse, UsageLogsRequest, User } from '../types';
const initialState: AdminState = {
  logs: [],
  allUsers: [],
  allSelectedUsers: [],
  users: [],
  selectedUsers: [],
  startDate: '',
  endDate: '',
  tableHeaders: [],
  isLoading: false,
  isLoadingUsers: false,
  error: null,
  formErrors: {},
  currentPage: 1,
  totalRecords: 0,
  availableRecords: 0,
  limit: 50,
  offset: 0,
  hasMoreData: false,
  selectedModelName: [],
  selectedRequestType: [],
  tokenSummary: []
}
export const validateChunkSizeField = (
  name: 'chunkSize' | 'overlapSize',
  value: number,
  compareValue?: number
): string | undefined => {
  if (!value || value <= 0) {
    return `Please enter a valid ${name === 'chunkSize' ? 'chunk size' : 'overlap size'}`;
  }
  return undefined;
};
export const validateChunkSizeForm = (
  data: { chunkSize: number; overlapSize: number }
): FormErrors => {
  const errors: FormErrors = {};
  const chunkSizeError = validateChunkSizeField('chunkSize', data.chunkSize);
  if (chunkSizeError) errors.chunkSize = chunkSizeError;
  const overlapSizeError = validateChunkSizeField('overlapSize', data.overlapSize, data.chunkSize);
  if (overlapSizeError) errors.overlapSize = overlapSizeError;
  return errors;
};
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Logo', 'Models', 'LogAnalysis', 'Users'],
  endpoints: (builder) => ({
    fetchUsageLogs: builder.mutation<LogsResponse, FetchLogsRequest>({
      query: (body) => ({
        url: '/getLLMLogs',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json', 'accept': 'application/json' }
      }),
      invalidatesTags: ['LogAnalysis'],
      transformResponse: (response: LogsResponse) => {
        if (response && response.records) {
          return {
            records: response.records.map((record: any) => {
              const filteredRecord = Object.keys(record)
                .filter(key => !key.startsWith('_'))
                .reduce((obj: any, key) => {
                  obj[key] = record[key];
                  return obj;
                }, {});
              return filteredRecord;
            }),
            total_returned: response.total_returned || 0,
            total_available: response.total_available || 0,
            tokens_summary: response.tokens_summary || []
          };
        }
        return { records: [], total_returned: 0, total_available: 0, tokens_summary: [] };
      }
    }),
    exportLogsCSV: builder.mutation<{ blob: Blob; filename: string }, FetchLogsRequest>({
      query: (body) => ({
        url: '/exportLogsCSV',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        responseHandler: async (response: Response) => {
          const blob = await response.blob();
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'usage-logs.xlsx';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, '');
            }
          }
          return { blob, filename };
        },
      }),
      invalidatesTags: ['LogAnalysis'],
    }),
    deleteLogs: builder.mutation<DeleteLogsResponse, DeleteLogsParams>({
      query: (body) => ({
        url: '/deleteLLMLogs',
        method: 'DELETE',
        body,
        headers: { 'Content-Type': 'application/json', 'accept': 'application/json' }
      }),
      invalidatesTags: ['LogAnalysis'],
    }),
    fetchUsers: builder.query<SearchUsersResponse, string>({
      query: (userId) => ({
        url: '/getUsersList',
        method: 'GET',
        headers: { 'user-id': userId }
      }),
      providesTags: ['Users']
    }),
    fetchAllUsers: builder.query<SearchUsersResponse, string>({
      query: (userId) => ({
        url: '/getAllUsers',
        method: 'GET',
        headers: { 'user-id': userId }
      }),
      providesTags: ['Users']
    }),
    getModels: builder.query<string[], void>({
      query: () => ({
        url: '/getModels',
        method: 'GET',
        headers: { 'accept': 'application/json' }
      }),
      providesTags: ['Models'],
      transformResponse: (response: ModelsResponse) => Array.isArray(response) ? response : []
    }),
    removeModel: builder.mutation<void, string>({
      query: (model) => ({
        url: '/removeModels',
        method: 'POST',
        body: { models: [model] }
      }),
      invalidatesTags: ['Models'],
      transformErrorResponse: (error: CustomError) => ({
        status: error.status,
        message: error.error
      })
    }),
    updateChunkSize: builder.mutation<ChunkSizeResponse, { chunkSize: number; overlapSize: number; userId: string }>({
      query: ({ chunkSize, overlapSize, userId }) => ({
        url: `/updateChunkSize?chunk_size=${chunkSize}&overlap_size=${overlapSize}`,
        method: 'PUT',
        headers: { 'user-id': userId }
      })
    }),
    updateRetrieverStatus: builder.mutation<RetrieverStatusResponse, string>({
      query: (status) => ({
        url: `/retrieverStatus?status=${encodeURIComponent(status)}`,
        method: 'PUT'
      })
    }),
    uploadLogo: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/uploadLogo',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Logo', id: 'LOGO' }],
      transformErrorResponse: (error: CustomError) => ({
        status: error.status,
        message: error.error || 'Failed to upload logo'
      })
    }),
    getLogo: builder.query<LogoResponse, void>({
      query: () => {
        return {
          url: '/auth/getLogo',
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      },
      transformResponse: (response: string | LogoResponse) => {
        if (typeof response === 'string') {
          return JSON.parse(response);
        }
        return response;
      },
      transformErrorResponse: (error: CustomError) => ({
        message: error.error || 'Failed to fetch logo',
      }),
      providesTags: [{ type: 'Logo', id: 'LOGO' }]
    })
  }),
});
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setTableHeaders: (state, action: PayloadAction<string[]>) => {
      state.tableHeaders = action.payload
    },
    setLogs: (state, action: PayloadAction<LogEntry[]>) => {
      state.logs = action.payload
    },
    setUsers: (state, action: PayloadAction<ApiUser[]>) => {
      state.users = action.payload
    },
    setSelectedUsers: (state, action: PayloadAction<string[]>) => {
      state.selectedUsers = action.payload
    },
    setAllUsers: (state, action: PayloadAction<ApiUser[]>) => {
      state.allUsers = action.payload
    },
    setAllSelectedUsers: (state, action: PayloadAction<string[]>) => {
      state.allSelectedUsers = action.payload
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setIsLoadingUsers: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUsers = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFormErrors: (state, action: PayloadAction<FormErrors>) => {
      state.formErrors = action.payload;
    },
    setFieldError: (state, action: PayloadAction<{ field: keyof FormErrors; error?: string }>) => {
      const { field, error } = action.payload;
      if (error) {
        state.formErrors[field] = error;
      } else {
        delete state.formErrors[field];
      }
    },
    clearFormErrors: (state) => {
      state.formErrors = {};
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
      state.offset = (action.payload - 1) * state.limit;
    },
    setAvailableRecords: (state, action: PayloadAction<number>) => {
      state.availableRecords = action.payload;
      state.hasMoreData = state.availableRecords > state.totalRecords;
    },
    setTotalRecords: (state, action: PayloadAction<number>) => {
      state.totalRecords = action.payload;
    },
    setOffset: (state, action: PayloadAction<number>) => {
      state.offset = action.payload;
      state.currentPage = Math.floor(action.payload / state.limit) + 1;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.offset = (state.currentPage - 1) * action.payload;
    },
    setSelectedModelName: (state, action: PayloadAction<string[]>) => {
      state.selectedModelName = action.payload;
    },
    setSelectedRequestType: (state, action: PayloadAction<string[]>) => {
      state.selectedRequestType = action.payload;
    },
    setTokenSummary: (state, action: PayloadAction<LogsTokenSummary[]>) => {
      state.tokenSummary = action.payload;
    },
    resetLogAnalysis: (state) => {
      state.logs = [];
      state.selectedUsers = [];
      state.allSelectedUsers = [];
      state.startDate = '',
        state.endDate = '',
        state.error = null;
      state.currentPage = 1;
      state.offset = 0;
      state.totalRecords = 0;
      state.availableRecords = 0;
      state.tokenSummary = [],
      state.hasMoreData = false;
      state.selectedModelName = [];
      state.selectedRequestType = [];
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.offset = 0;
      state.totalRecords = 0;
      state.availableRecords = 0;
      state.tokenSummary = [];
      state.hasMoreData = false;
    }
  },
});
export const {
  setLogs,
  setUsers,
  setSelectedUsers,
  setAllUsers,
  setAllSelectedUsers,
  setStartDate,
  setEndDate,
  setTableHeaders,
  setIsLoading,
  setIsLoadingUsers,
  resetLogAnalysis,
  setError,
  setFieldError,
  setFormErrors,
  clearFormErrors,
  setCurrentPage,
  setTotalRecords,
  setAvailableRecords,
  setOffset,
  setLimit,
  setSelectedModelName,
  setSelectedRequestType,
  setTokenSummary,
  resetPagination
} = adminSlice.actions;
export const {
  useGetLogoQuery,
  useGetModelsQuery,
  useRemoveModelMutation,
  useUpdateChunkSizeMutation,
  useUpdateRetrieverStatusMutation,
  useUploadLogoMutation,
  useFetchUsageLogsMutation,
  useExportLogsCSVMutation,
  useFetchUsersQuery,
  useFetchAllUsersQuery,
  useDeleteLogsMutation
} = adminApi;
export default adminSlice.reducer;