import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '@/redux/lib/customBaseQuery';
import { QueueItem, UploadResponse, QueueResponse, FileStatusUploadResponse, Document, FetchDocument, DeleteResponse } from '@/types/doc-types';
import { GetAllDocumentsRequest, GetAllDocumentsResponse, SelectedCategories } from '../types';
const isBrowser = typeof window !== 'undefined';
const loadPersistedState = (): FileUploadState => {
  if (!isBrowser) {
    return {
      files: [],
      duplicateFiles: 0,
      totalFileCount: 0,
      isUploading: false,
      isCategorizing: false,
      searchTerm: '',
      selectAll: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalRecords: 0,
      availableRecords: 0,
      limit: 50,
      offset: 0,
      hasMoreData: false
    };
  }
  try {
    const persistedFiles = localStorage.getItem('uploadQueue');
    return {
      files: persistedFiles ? JSON.parse(persistedFiles) : [],
      duplicateFiles: 0,
      totalFileCount: 0,
      isUploading: false,
      searchTerm: '',
      selectAll: [],
      isLoading: false,
      error: null,
      isCategorizing: false,
      currentPage: 1,
      totalRecords: 0,
      availableRecords: 0,
      limit: 50,
      offset: 0,
      hasMoreData: false
    };
  } catch (error) {
    console.log('Error loading persisted state:', error);
    return {
      files: [],
      duplicateFiles: 0,
      totalFileCount: 0,
      isUploading: false,
      searchTerm: '',
      selectAll: [],
      isLoading: false,
      error: null,
      isCategorizing: false,
      currentPage: 1,
      totalRecords: 0,
      availableRecords: 0,
      limit: 50,
      offset: 0,
      hasMoreData: false
    };
  }
};
interface FileUploadState {
  files: Document[];
  duplicateFiles: number;
  totalFileCount: number,
  isUploading: boolean;
  searchTerm: string;
  selectAll: FetchDocument[];
  isLoading: boolean;
  error: string | null;
  isCategorizing: boolean;
  currentPage: number,
  totalRecords: number,
  availableRecords: number,
  limit: number,
  offset: number,
  hasMoreData: boolean
}
const initialState: FileUploadState = loadPersistedState();
const generateUniqueKey = (prefix: string, identifier: string) => {
  const time = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${identifier}-${time}-${random}`;
};
export const fileUploadApi = createApi({
  reducerPath: 'fetchDocuments',
  baseQuery: customBaseQuery,
  tagTypes: ['Documents'],
  endpoints: (builder) => ({
    getDocuments: builder.query<FetchDocument[], string>({
      query: (userId) => ({
        url: '/getAllDocs',
        method: 'POST',
        headers: { 'user-id': userId, accept: 'application/json' },
      }),
      providesTags: ['Documents'],
    }),
    fetchAllDocuments: builder.mutation<GetAllDocumentsResponse, GetAllDocumentsRequest>({
      query: (params) => ({
        url: '/getAllFiles',
        method: 'POST',
        headers: {
          'user-id': params.user_id,
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          offset: params.offset,
          limit: params.limit,
          order: params.order,
          ...(params.category_ids && { category_ids: params.category_ids }),
        }
      }),
      invalidatesTags: ['Documents'],
      transformResponse: (response: GetAllDocumentsResponse) => {
        if (!response?.records) {
          return {
            records: [],
            total_returned: 0,
            total_available: 0,
            summary: []
          };
        }
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
          summary: response.summary || []
        };
      }
    }),
    deleteDocuments: builder.mutation<DeleteResponse, { fileId: string; userId: string }>({
      query: ({ fileId, userId }) => ({
        url: '/deleteFileByFileId',
        method: 'DELETE',
        headers: { 'user-id': userId, 'file-id': fileId, accept: 'application/json' },
      }),
      invalidatesTags: ['Documents'],
    }),
    deleteMultiDoc: builder.mutation<DeleteResponse, { fileIds: string[]; userId: string }>({
      query: ({ fileIds, userId }) => ({
        url: '/deleteMultipleFiles',
        method: 'DELETE',
        headers: { 'user-id': userId, 'accept': 'application/json', 'Content-Type': 'application/json' },
        body: fileIds,
      }),
      invalidatesTags: ['Documents'],
    }),
    uploadFile: builder.mutation<UploadResponse, {
      file: File;
      userId: string;
      categorization_mode: 'manual' | 'auto' | 'skip';
      categorization_id?: string;
      selected_categories?: SelectedCategories[];
    }>({
      async queryFn({ file, userId, categorization_mode, categorization_id, selected_categories }, { dispatch }, _extraOptions, baseQuery) {
        const tempId = generateUniqueKey('temp', file.name);
        dispatch(addFile({
          file_id: tempId,
          name: file.name,
          status: 'uploading',
          progress: 0,
        }));
        const simulateProgress = () => {
          let currentProgress = 0;
          const interval = setInterval(() => {
            if (currentProgress < 90) {
              currentProgress += 10;
              dispatch(updateFileProgress({ file_id: tempId, progress: currentProgress }));
            } else {
              clearInterval(interval);
            }
          }, 1000);
          return interval;
        };
        const progressInterval = simulateProgress();
        try {
          const formData = new FormData();
          formData.append('files', file);
          formData.append('options', '');
          if (categorization_mode) {
            formData.append('categorization_mode', categorization_mode);
            if (categorization_mode === 'manual' && categorization_id && categorization_id.length > 0) {
              formData.append('categorization_id', categorization_id);
            } else if (categorization_mode === 'auto') {
              formData.append('categorization_id', '');
              if (selected_categories && selected_categories.length > 0) {
                formData.append('selected_categories', JSON.stringify(selected_categories));
              }
            }
          }
          const result = await baseQuery({
            url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/document/UploadDoc`,
            method: 'POST',
            body: formData,
            headers: {
              'accept': 'application/json',
              'user-id': userId
            }
          });
          if (result.error) {
            throw result.error;
          }
          const data = result.data as FileStatusUploadResponse;
          clearInterval(progressInterval);
          dispatch(updateFileProgress({ file_id: tempId, progress: 100 }));
          if (data.file_metadata[0].status === 'File already exists') {
            dispatch(setError('File already exists'));
            dispatch(updateFileStatus({
              file_id: tempId,
              status: 'Duplicate',
              progress: 100
            }));
            setTimeout(() => {
              dispatch(removeFile(tempId));
            }, 2e3);
            return { data: null as any };
          }
          dispatch(updateFileStatus({
            file_id: tempId,
            server_file_id: data.file_metadata[0].file_id,
            status: 'processing',
            file_path: data.file_metadata[0].file_path,
            datetime: data.file_metadata[0].datetime,
          }));
          return { data: data.file_metadata[0] };
        } catch (error: any) {
          dispatch(removeFile(tempId));
          return {
            error: {
              status: error.status || 500,
              data: error.message || 'Upload failed',
              error: error.error
            }
          };
        }
      }
    }),
    pollDocumentStatus: builder.query<GetAllDocumentsResponse, GetAllDocumentsRequest>({
      query: (params) => ({
        url: '/getAllFiles',
        method: 'POST',
        headers: {
          'user-id': params.user_id,
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          offset: params.offset,
          limit: params.limit,
          order: params.order,
          ...(params.category_ids && { category_ids: params.category_ids }),
        }
      }),
      transformResponse: (response: GetAllDocumentsResponse) => {
        if (!response?.records) {
          return {
            records: [],
            total_returned: 0,
            total_available: 0,
            summary: []
          };
        }
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
          summary: response.summary || []
        };
      }
    }),
    checkQueueStatus: builder.query<QueueResponse, string>({
      query: (userId) => ({
        url: '/uploadFileStatus',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      }),
      keepUnusedDataFor: 0,
    }),
    updateDocumentCategories: builder.mutation<any, {
      file_ids: string[];
      categorization_mode: 'manual' | 'auto' | 'skip';
      category_id?: string | string[];
      userId: string;
      selected_categories?: SelectedCategories[]
    }>({
      query: ({ file_ids, categorization_mode, category_id, selected_categories, userId }) => ({
        url: '/updateDocumentCategory',
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: {
          file_ids,
          categorization_mode,
          category_id,
          selected_categories
        },
      }),
      invalidatesTags: ['Documents'],
    }),
  }),
});
const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    clearSearchTerm: (state) => {
      state.searchTerm = '';
    },
    setSelectAll: (state, action: PayloadAction<FetchDocument[]>) => {
      state.selectAll = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    addFile: (state, action: PayloadAction<Document>) => {
      state.files.push(action.payload);
      if (isBrowser) {
        localStorage.setItem('uploadQueue', JSON.stringify(state.files));
      }
    },
    updateFileProgress: (state, action: PayloadAction<{ file_id: string; progress: number }[] | { file_id: string; progress: number }>) => {
      const updates = Array.isArray(action.payload) ? action.payload : [action.payload];
      updates.forEach(update => {
        const file = state.files.find((file) => file.file_id === update.file_id);
        if (file) {
          file.progress = update.progress;
        }
      });
      if (isBrowser) {
        localStorage.setItem('uploadQueue', JSON.stringify(state.files));
      }
    },
    updateFileStatus: (state, action: PayloadAction<Document>) => {
      const index = state.files.findIndex((file) => file.file_id === action.payload.file_id);
      if (index !== -1) {
        state.files[index] = {
          ...state.files[index],
          ...action.payload
        };
        if (isBrowser) {
          localStorage.setItem('uploadQueue', JSON.stringify(state.files));
        }
      }
    },
    syncQueueStatus: (state, action: PayloadAction<QueueItem[]>) => {
      state.files = state.files.filter(file => {
        if (file.status === 'error') {
          return false;
        }
        const queueItem = action.payload.find(
          item => item.metadata.file_id === file.server_file_id
        );
        if (!queueItem || (queueItem.status !== 'Failed' || 'Uploading' || 'error')) {
          if (queueItem) {
            file.status = queueItem.status as Document['status'];
            file.error = queueItem.error || undefined;
            file.file_path = queueItem.metadata.file_path;
            file.datetime = queueItem.metadata.datetime;
          }
          return true;
        }
        return false;
      });
      if (isBrowser) {
        localStorage.setItem('uploadQueue', JSON.stringify(state.files));
      }
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(f => f.file_id !== action.payload);
      if (isBrowser) {
        localStorage.setItem('uploadQueue', JSON.stringify(state.files));
      }
    },
    clearCompleted: (state) => {
      state.files = state.files.filter(f => f.status !== 'Success');
      if (isBrowser) {
        localStorage.setItem('uploadQueue', JSON.stringify(state.files));
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setDuplicateFiles: (state, action: PayloadAction<number>) => {
      state.duplicateFiles = action.payload;
    },
    setTotalFileCount: (state, action: PayloadAction<number>) => {
      state.totalFileCount = action.payload;
    },
    clearDuplicateCount: (state) => {
      state.duplicateFiles = 0;
    },
    setIsCategorizing: (state, action: PayloadAction<boolean>) => {
      state.isCategorizing = action.payload;
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
    resetPagination: (state) => {
      state.currentPage = 1;
      state.offset = 0;
      state.totalRecords = 0;
      state.availableRecords = 0;
      state.hasMoreData = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(fileUploadApi.endpoints.getDocuments.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(fileUploadApi.endpoints.getDocuments.matchFulfilled, (state) => {
        state.isLoading = false;
      })
      .addMatcher(fileUploadApi.endpoints.getDocuments.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while fetching documents';
      })
      .addMatcher(fileUploadApi.endpoints.fetchAllDocuments.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(fileUploadApi.endpoints.fetchAllDocuments.matchFulfilled, (state) => {
        state.isLoading = false;
      })
      .addMatcher(fileUploadApi.endpoints.fetchAllDocuments.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while fetching documents';
      })
      .addMatcher(fileUploadApi.endpoints.deleteDocuments.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(fileUploadApi.endpoints.deleteDocuments.matchFulfilled, (state) => {
        state.isLoading = false;
      })
      .addMatcher(fileUploadApi.endpoints.deleteDocuments.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while deleting document';
      })
      .addMatcher(fileUploadApi.endpoints.deleteMultiDoc.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(fileUploadApi.endpoints.deleteMultiDoc.matchFulfilled, (state) => {
        state.isLoading = false;
      })
      .addMatcher(fileUploadApi.endpoints.deleteMultiDoc.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while deleting documents';
      })
      .addMatcher(fileUploadApi.endpoints.uploadFile.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(fileUploadApi.endpoints.uploadFile.matchFulfilled, (state) => {
        state.isLoading = false;
      })
      .addMatcher(fileUploadApi.endpoints.uploadFile.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while uploading file';
      })
  },
});
export const {
  setSelectAll,
  setSearchTerm,
  setIsUploading,
  addFile,
  updateFileStatus,
  syncQueueStatus,
  removeFile,
  clearCompleted,
  setError,
  updateFileProgress,
  clearSearchTerm,
  setDuplicateFiles,
  clearDuplicateCount,
  setTotalFileCount,
  setIsCategorizing,
  setCurrentPage,
  setAvailableRecords,
  setTotalRecords,
  setOffset,
  setLimit,
  resetPagination
} = documentSlice.actions;
export const {
  useGetDocumentsQuery,
  useFetchAllDocumentsMutation,
  useDeleteDocumentsMutation,
  useUploadFileMutation,
  usePollDocumentStatusQuery,
  useCheckQueueStatusQuery,
  useDeleteMultiDocMutation,
  useUpdateDocumentCategoriesMutation
} = fileUploadApi;
export default documentSlice.reducer;