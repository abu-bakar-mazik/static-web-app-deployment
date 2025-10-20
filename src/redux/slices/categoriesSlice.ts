import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../lib/customBaseQuery';
import {
  Category,
  NewCategory,
  UpdateCategory,
  CategoryValidationError,
  CategoryState,
  DeleteCategoriesRequest,
  DeleteCategoryRequest,
  SaveCategoryRequest
} from '@/types/category-types';
const initialState: CategoryState = {
  categories: [],
  filteredCategories: [],
  editingId: null,
  searchQuery: '',
  isLoading: false,
  error: null,
  validationError: {},
  previousCategoryState: null,
};
const cleanupTemporaryCategories = (state: CategoryState) => {
  state.categories = state.categories.filter(category => !category.id.startsWith('temp'));
  state.editingId = null;
};
export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Categories'],
  endpoints: (builder) => ({
    getAllCategories: builder.query<Category[], string>({
      query: (userId) => ({
        url: 'getCategories',
        method: 'GET',
        headers: {
          "user-id": userId,
        },
      }),
      providesTags: ['Categories'],
    }),
    getCategoryById: builder.query<Category, { userId: string; categoryId: string }>({
      query: ({ userId, categoryId }) => ({
        url: `getCategory/${categoryId}`,
        method: 'GET',
        headers: {
          "user-id": userId,
        },
      }),
      providesTags: (result, error, { categoryId }) => [{ type: 'Categories', id: categoryId }],
    }),
    saveCategory: builder.mutation<Category, SaveCategoryRequest>({
      query: ({ category, userId }) => {
        const isUpdate = 'category_id' in category;
        return {
          url: isUpdate ? 'updateCategory' : 'createCategory',
          method: isUpdate ? 'PUT' : 'POST',
          body: category,
          headers: {
            "user-id": userId,
          },
        };
      },
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation<{ status: string; category_id: string }, DeleteCategoryRequest>({
      query: ({ userId, categoryId }) => ({
        url: 'deleteCategory',
        method: 'DELETE',
        body: { category_id: categoryId },
        headers: {
          "user-id": userId,
        },
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteSelectedCategories: builder.mutation<{ status: string }, DeleteCategoriesRequest>({
      query: ({ userId, categoryIds }) => ({
        url: 'deleteSelectedCategories',
        method: 'DELETE',
        body: { category_ids: categoryIds },
        headers: {
          "user-id": userId,
        },
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteAllCategories: builder.mutation<{ status: string }, string>({
      query: (userId) => ({
        url: 'bulkDeleteCategories',
        method: 'DELETE',
        headers: {
          "user-id": userId,
        },
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});
export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useSaveCategoryMutation,
  useDeleteCategoryMutation,
  useDeleteSelectedCategoriesMutation,
  useDeleteAllCategoriesMutation,
} = categoriesApi;
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state) => {
      const tempId = `temp-${Date.now()}`;
      const newCategory: Category = {
        category_name: '',
        created_datetime: new Date().toISOString(),
        id: tempId,
        mapped_prompts: [],
        rules: '',
        updated_datetime: new Date().toISOString(),
        user_display_name: '',
        user_email: '',
        user_id: '',
      };
      state.categories.unshift(newCategory);
      state.editingId = tempId;
      state.validationError = {};
    },
    setEditingId: (state, action: PayloadAction<string | null>) => {
      state.editingId = action.payload;
      state.validationError = {};
    },
    updateCategoryField: (state, action: PayloadAction<{ id: string; field: keyof Category; value: any }>) => {
      const { id, field, value } = action.payload;
      const category = state.categories.find(cat => cat.id === id);
      if (category) {
        if (field === 'category_name' && typeof value === 'string' && value.length > 60) {
          (category as any)[field] = value.substring(0, 60);
        } else {
          (category as any)[field] = value;
        }
        category.updated_datetime = new Date().toISOString();
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
    validateCategory: (state, action: PayloadAction<{ category_name: string; rules: string }>) => {
      const { category_name, rules } = action.payload;
      const errors: CategoryValidationError = {};
      if (!category_name?.trim()) {
        errors.category_name = 'Category name is required';
      } else if (category_name.length > 60) {
        errors.category_name = 'Category name must be 60 characters or less';
      }
      if (!rules?.trim()) {
        errors.rules = 'Rules are required';
      }
      state.validationError = errors;
    },
    clearValidationError: (state) => {
      state.validationError = {};
    },
    clearTemporaryCategories: (state) => {
      cleanupTemporaryCategories(state);
      state.validationError = {};
    },
    savePreviousState: (state, action: PayloadAction<{ categoryId: string }>) => {
      const { categoryId } = action.payload;
      const category = state.categories.find(cat => cat.id === categoryId);
      if (category) {
        state.previousCategoryState = { ...category };
      }
    },
    restorePreviousState: (state) => {
      if (state.previousCategoryState && state.editingId) {
        const categoryIndex = state.categories.findIndex(cat => cat.id === state.editingId);
        if (categoryIndex !== -1) {
          state.categories[categoryIndex] = { ...state.previousCategoryState };
        }
        state.previousCategoryState = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(categoriesApi.endpoints.getAllCategories.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(categoriesApi.endpoints.getAllCategories.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addMatcher(categoriesApi.endpoints.getAllCategories.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });
  },
});
export const {
  addCategory,
  setEditingId,
  updateCategoryField,
  setSearchQuery,
  clearSearchQuery,
  validateCategory,
  clearValidationError,
  clearTemporaryCategories,
  savePreviousState,
  restorePreviousState,
} = categoriesSlice.actions;
export const selectFilteredCategories = createSelector(
  [(state: RootState) => state.categories.categories, (state: RootState) => state.categories.searchQuery],
  (categories, searchQuery) => {
    let filteredCategories = categories;
    if (searchQuery.trim()) {
      filteredCategories = categories.filter(category =>
        category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.rules.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [...filteredCategories].sort((a, b) => {
      const dateA = new Date(a.updated_datetime).getTime();
      const dateB = new Date(b.updated_datetime).getTime();
      return dateB - dateA;
    });
  }
);
export const selectEditingId = (state: RootState) => state.categories.editingId;
export const selectSearchQuery = (state: RootState) => state.categories.searchQuery;
export const selectValidationError = (state: RootState) => state.categories.validationError;
export default categoriesSlice.reducer;
