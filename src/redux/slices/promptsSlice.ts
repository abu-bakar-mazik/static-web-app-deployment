import { createSlice, PayloadAction, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../lib/customBaseQuery';
import { DuplicatePromptRequest, DuplicatePromptResponse, Prompt, RemoveFromViewRequest, RemoveFromViewResponse, ValidationError } from '@/types/prompt-types';
import { SharedPrompt, SharePromptRequest, SharePromptResponse } from '@/types/sharing-types';
import { SearchUsersResponse } from '../types';
interface PromptIdentifier {
  promptId: string;
  promptIndex: number;
  promptText: string;
}
interface PromptsState {
  selectedPrompts: PromptIdentifier[];
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  editingId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  validationError: ValidationError;
  previousPromptState: Prompt | null;
}
interface SharedPromptsResponse {
  shared_prompts: SharedPrompt[];
  total_count: number;
}
const initialState: PromptsState = {
  selectedPrompts: [],
  prompts: [],
  filteredPrompts: [],
  editingId: null,
  searchQuery: '',
  isLoading: false,
  error: null,
  validationError: {},
  previousPromptState: null,
};
const cleanupTemporaryPrompts = (state: PromptsState) => {
  state.prompts = state.prompts.filter((prompt) => !prompt.id.startsWith('temp'));
  state.editingId = null;
};
export const promptsApi = createApi({
  reducerPath: 'promptsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Prompts', 'SharedPrompts'],
  endpoints: (builder) => ({
    getAllPrompts: builder.query<Prompt[], string>({
      query: (userId) => ({
        url: 'getAllPrompts',
        method: 'GET',
        headers: {
          'user-id': userId,
        },
      }),
      transformResponse: (response: { prompts: any[] }) => {
        if (!response || !response.prompts) {
          return [];
        }
        return response.prompts.map((p) => ({
          id: p.id,
          title: p.title,
          prompt: Array.isArray(p.prompts[0]) ? p.prompts[0] : p.prompts,
          datetime: p.datetime,
          is_owner: p.is_owner,
          shared_by: p.shared_by,
        }));
      },
      providesTags: ['Prompts'],
    }),
    savePrompt: builder.mutation<Prompt, { prompt: Prompt; userId: string }>({
      query: ({ prompt, userId }) => {
        const nonEmptyPrompts = prompt.prompt.filter((p) => p?.trim());
        if (!prompt.title.trim() || nonEmptyPrompts.length === 0) {
          throw new Error('Title and at least one prompt are required');
        }
        return {
          url: prompt.id.startsWith('temp') ? 'insertAllPrompts' : 'updatePrompts',
          method: prompt.id.startsWith('temp') ? 'POST' : 'PUT',
          headers: {
            'user-id': userId,
          },
          body: {
            prompt_id: prompt.id,
            title: prompt.title,
            prompt: prompt.id.startsWith('temp') ? [nonEmptyPrompts] : nonEmptyPrompts,
            datetime: prompt.datetime,
          },
        };
      },
      transformResponse: (response: any) => {
        if (response.prompts) {
          return {
            id: response.prompt_id || response.id,
            title: response.title,
            prompt: Array.isArray(response.prompts[0]) ? response.prompts[0] : response.prompts,
            datetime: response.datetime || new Date().toISOString(),
          };
        }
        return {
          id: response.prompt_id || response.id,
          title: response.title,
          prompt: Array.isArray(response.prompt) ? response.prompt : [response.prompt],
          datetime: response.datetime || new Date().toISOString(),
        };
      },
      invalidatesTags: ['Prompts'],
    }),
    deletePrompt: builder.mutation<void, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: 'deleteByPromptId',
        method: 'DELETE',
        body: { prompt_id: id },
        headers: {
          accept: 'application/json',
          'user-id': userId,
        },
      }),
      invalidatesTags: ['Prompts'],
    }),
    deleteAllPrompts: builder.mutation<void, string>({
      query: (userId) => ({
        url: 'deleteBulkPrompts',
        method: 'DELETE',
        headers: { 'user-id': userId },
      }),
      invalidatesTags: ['Prompts'],
    }),
    sharePrompt: builder.mutation<SharePromptResponse, { userId: string; shareRequest: SharePromptRequest }>({
      query: ({ userId, shareRequest }) => ({
        url: 'sharePrompt',
        method: 'POST',
        headers: {
          'user-id': userId,
        },
        body: shareRequest,
      }),
      invalidatesTags: ['Prompts', 'SharedPrompts'],
    }),
    removeFromMyView: builder.mutation<RemoveFromViewResponse, { userId: string; removeRequest: RemoveFromViewRequest }>({
      query: ({ userId, removeRequest }) => ({
        url: 'removeFromMyView',
        method: 'POST',
        headers: {
          'user-id': userId,
        },
        body: removeRequest,
      }),
      invalidatesTags: ['Prompts', 'SharedPrompts'],
    }),
    searchUsers: builder.query<SearchUsersResponse, { userId: string; searchQuery: string; limit?: number }>({
      query: ({ userId, searchQuery, limit = 20 }) => ({
        url: `searchUsers?search_query=${encodeURIComponent(searchQuery)}&limit=${limit}`,
        method: 'GET',
        headers: {
          'user-id': userId,
        },
      }),
    }),
    duplicatePrompt: builder.mutation<DuplicatePromptResponse, { userId: string; duplicateRequest: DuplicatePromptRequest }>({
      query: ({ userId, duplicateRequest }) => ({
        url: 'duplicatePrompt',
        method: 'POST',
        headers: {
          'user-id': userId,
        },
        body: duplicateRequest,
      }),
      invalidatesTags: ['Prompts'],
    }),
  }),
});
export const { useGetAllPromptsQuery, useSavePromptMutation, useDeletePromptMutation, useDeleteAllPromptsMutation, useSharePromptMutation, useRemoveFromMyViewMutation, useSearchUsersQuery, useDuplicatePromptMutation } = promptsApi;
const findPromptIdentifier = (selectedPrompts: PromptIdentifier[], promptId: string, promptIndex: number): PromptIdentifier | undefined => {
  return selectedPrompts.find((item) => item.promptId === promptId && item.promptIndex === promptIndex);
};
const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    clearTemporaryPrompts: (state) => {
      cleanupTemporaryPrompts(state);
    },
    addPromptField: (state, action: PayloadAction<string>) => {
      const promptId = action.payload;
      const prompt = state.prompts.find((p) => p.id === promptId);
      if (prompt) {
        prompt.prompt.push('');
      }
    },
    removePromptField: (state, action: PayloadAction<{ promptId: string; index: number }>) => {
      const { promptId, index } = action.payload;
      const prompt = state.prompts.find((p) => p.id === promptId);
      if (prompt && prompt.prompt.length > 1) {
        state.selectedPrompts = state.selectedPrompts.filter((item) => !(item.promptId === promptId && item.promptIndex === index));
        state.selectedPrompts = state.selectedPrompts.map((item) => {
          if (item.promptId === promptId && item.promptIndex > index) {
            return {
              ...item,
              promptIndex: item.promptIndex - 1,
            };
          }
          return item;
        });
        prompt.prompt.splice(index, 1);
      }
    },
    addPrompt: (state) => {
      cleanupTemporaryPrompts(state);
      const newPrompt: Prompt = {
        id: `temp-${Date.now()}`,
        title: '',
        prompt: [''],
        datetime: new Date().toISOString(),
      };
      state.prompts.unshift(newPrompt);
      state.editingId = newPrompt.id;
    },
    setEditingId: (state, action: PayloadAction<string | null>) => {
      state.editingId = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    validatePrompt: (state, action: PayloadAction<{ title: string; prompt: string[] }>) => {
      const { title, prompt } = action.payload;
      const errors: ValidationError = {};
      if (!title?.trim()) {
        errors.title = 'Title is required';
      }
      const nonEmptyPrompts = prompt.filter((p) => p?.trim());
      if (nonEmptyPrompts.length === 0) {
        errors.prompt = ['At least one prompt is required'];
      }
      state.validationError = errors;
    },
    clearValidationError: (state) => {
      state.validationError = {};
    },
    updatePromptField: (state, action: PayloadAction<{ id: string; field: keyof Prompt; value: string | string[] }>) => {
      const { id, field, value } = action.payload;
      const prompt = state.prompts.find((p) => p.id === id);
      if (prompt) {
        (prompt[field] as typeof value) = value;
        if (field === 'title') {
          delete state.validationError.title;
        } else if (field === 'prompt') {
          delete state.validationError.prompt;
        }
      }
    },
    setPrompts: (state, action: PayloadAction<Prompt[]>) => {
      state.prompts = action.payload;
    },
    togglePrompt: (
      state,
      action: PayloadAction<{
        id: string;
        title: string;
        prompt: string[];
        promptIndices?: number[];
        datetime: string;
        isParent: boolean;
        isSelected: boolean;
      }>,
    ) => {
      const { id, prompt: prompts, promptIndices, isParent, isSelected } = action.payload;
      if (isParent) {
        const targetPrompt = state.prompts.find((p) => p.id === id);
        if (!targetPrompt) return;
        if (isSelected) {
          targetPrompt.prompt.forEach((promptText, index) => {
            if (promptText.trim() === '') return;
            const existing = findPromptIdentifier(state.selectedPrompts, id, index);
            if (!existing) {
              state.selectedPrompts.push({
                promptId: id,
                promptIndex: index,
                promptText: promptText,
              });
            }
          });
        } else {
          state.selectedPrompts = state.selectedPrompts.filter((item) => item.promptId !== id);
        }
      } else {
        const indices = promptIndices || [0];
        const index = indices[0];
        const promptText = prompts[0];
        if (isSelected) {
          const existing = findPromptIdentifier(state.selectedPrompts, id, index);
          if (!existing && promptText.trim() !== '') {
            state.selectedPrompts.push({
              promptId: id,
              promptIndex: index,
              promptText: promptText,
            });
          }
        } else {
          state.selectedPrompts = state.selectedPrompts.filter((item) => !(item.promptId === id && item.promptIndex === index));
        }
      }
    },
    clearSelectedPrompts: (state) => {
      state.selectedPrompts = [];
    },
    clearSearchQuery: (state) => {
      state.filteredPrompts = [];
      state.searchQuery = '';
    },
    setSelectedPrompts: (state, action: PayloadAction<PromptIdentifier[]>) => {
      state.selectedPrompts = action.payload;
    },
    savePreviousState: (state, action) => {
      const { promptId } = action.payload;
      const prompt = state.prompts.find((p) => p.id === promptId);
      if (prompt) {
        state.previousPromptState = JSON.parse(JSON.stringify(prompt));
      }
    },
    restorePreviousState: (state) => {
      if (state.editingId && state.previousPromptState) {
        const promptIndex = state.prompts.findIndex((p) => p.id === state.editingId);
        if (promptIndex !== -1) {
          state.prompts[promptIndex] = JSON.parse(JSON.stringify(state.previousPromptState));
        }
        state.previousPromptState = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(promptsApi.endpoints.getAllPrompts.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(promptsApi.endpoints.getAllPrompts.matchFulfilled, (state, action) => {
        state.isLoading = false;

        // Preserve any temporary prompts that might be in editing mode
        const tempPrompts = state.prompts.filter((prompt) => prompt.id.startsWith('temp'));
        const apiPrompts = action.payload;

        // Combine temporary prompts with API prompts, keeping temp prompts at the beginning
        state.prompts = [...tempPrompts, ...apiPrompts];

        // Only clear search query if we're not in editing mode
        if (!state.editingId) {
          state.searchQuery = '';
        }

        // Only save non-temporary prompts to localStorage
        localStorage.setItem('prompts', JSON.stringify(apiPrompts));
      })
      .addMatcher(promptsApi.endpoints.getAllPrompts.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while fetching prompts';
      })
      .addMatcher(promptsApi.endpoints.savePrompt.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(promptsApi.endpoints.savePrompt.matchFulfilled, (state, action) => {
        state.isLoading = false;
        const prompt = action.payload;
        state.prompts = state.prompts.map((p) => (p.id === prompt.id || p.id.startsWith('temp') ? { ...p, ...prompt } : p));
        localStorage.setItem('prompts', JSON.stringify(state.prompts));
        state.editingId = null;
      })
      .addMatcher(promptsApi.endpoints.savePrompt.matchRejected, (state, action) => {
        state.isLoading = false;
        if (action.error.message === 'Title and description are required') {
          const currentPrompt = state.prompts.find((p) => p.id === state.editingId);
          const errors: ValidationError = {};
          if (!currentPrompt?.title?.trim()) {
            errors.title = 'Title is required';
          }
          if (!currentPrompt?.prompt?.length) {
            errors.prompt = ['At least one prompt is required'];
          } else {
            const promptErrors = currentPrompt.prompt.map((p) => (!p?.trim() ? 'This field is required' : ''));
            if (promptErrors.some((error) => error)) {
              errors.prompt = promptErrors;
            }
          }
          state.validationError = errors;
        } else {
          state.error = action.error.message || 'An error occurred while saving the prompt';
        }
      })
      .addMatcher(promptsApi.endpoints.deletePrompt.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(promptsApi.endpoints.deletePrompt.matchFulfilled, (state, action) => {
        state.isLoading = false;
        const { id } = action.meta.arg.originalArgs;
        state.selectedPrompts = state.selectedPrompts.filter((selectedPrompt) => selectedPrompt.promptId !== id);
        state.prompts = state.prompts.filter((p) => p.id !== id);
        localStorage.setItem('prompts', JSON.stringify(state.prompts));
      })
      .addMatcher(promptsApi.endpoints.deletePrompt.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while deleting the prompt';
      })
      .addMatcher(promptsApi.endpoints.deleteAllPrompts.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(promptsApi.endpoints.deleteAllPrompts.matchFulfilled, (state) => {
        state.isLoading = false;
        state.prompts = [];
        localStorage.removeItem('prompts');
      })
      .addMatcher(promptsApi.endpoints.deleteAllPrompts.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while deleting all prompts';
      })
      .addMatcher(promptsApi.endpoints.duplicatePrompt.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(promptsApi.endpoints.duplicatePrompt.matchFulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addMatcher(promptsApi.endpoints.duplicatePrompt.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred while duplicating the prompt';
      });
  },
});
export const { addPrompt, setEditingId, setSearchQuery, updatePromptField, setPrompts, togglePrompt, clearSelectedPrompts, validatePrompt, clearTemporaryPrompts, clearSearchQuery, addPromptField, removePromptField, setSelectedPrompts, savePreviousState, restorePreviousState, clearValidationError } = promptsSlice.actions;
export const selectPrompts = (state: RootState) => state.prompts.prompts;
export const selectSelectedPrompts = createSelector([(state: RootState) => state.prompts.selectedPrompts], (selectedPrompts) => selectedPrompts.map((item) => item.promptText));
export const selectSelectedPromptIdentifiers = (state: RootState) => state.prompts.selectedPrompts;
export const selectEditingId = (state: RootState) => state.prompts.editingId;
export const selectSearchQuery = (state: RootState) => state.prompts.searchQuery;
export const selectValidationError = (state: RootState) => state.prompts.validationError;
export const validateSelectedPrompts = createAsyncThunk('prompts/validateSelectedPrompts', async (_, { getState, dispatch }) => {
  const state = getState() as RootState;
  const prompts = selectPrompts(state);
  const selectedPromptIdentifiers = selectSelectedPromptIdentifiers(state);
  const validSelectedPrompts = selectedPromptIdentifiers.filter((identifier) => {
    const promptGroup = prompts.find((p) => p.id === identifier.promptId);
    if (!promptGroup) return false;
    return promptGroup.prompt[identifier.promptIndex] === identifier.promptText;
  });
  if (validSelectedPrompts.length !== selectedPromptIdentifiers.length) {
    dispatch(setSelectedPrompts(validSelectedPrompts));
  }
  return validSelectedPrompts.map((item) => item.promptText);
});
export const selectFilteredPrompts = createSelector(
  (state: RootState) => state.prompts.prompts,
  (state: RootState) => state.prompts.searchQuery,
  (state: RootState) => state.prompts.editingId,
  (prompts, searchQuery, editingId) => {
    const filteredPrompts = editingId ? prompts : prompts.filter((prompt) => !prompt.id.startsWith('temp'));
    if (!searchQuery || searchQuery.trim() === '') {
      return filteredPrompts;
    }
    return filteredPrompts.filter((prompt) => {
      if (prompt.id === editingId) {
        return true;
      }
      const searchLower = searchQuery.toLowerCase();
      const titleLower = prompt.title.toLowerCase();
      const promptsLower = prompt.prompt.map((p) => p.toLowerCase());
      return titleLower.includes(searchLower) || promptsLower.some((p) => p.includes(searchLower));
    });
  },
);
export default promptsSlice.reducer;
