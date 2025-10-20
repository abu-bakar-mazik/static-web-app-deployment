export interface MappedPrompt {
  datetime: string;
  id: string;
  prompts: string[];
  title: string;
  user_id: string;
}
export interface Category {
  category_name: string;
  created_datetime: string;
  id: string;
  mapped_prompts: MappedPrompt[];
  rules: string;
  updated_datetime: string;
  user_display_name: string;
  user_id: string;
  user_email: string;
}

export interface NewCategory {
  category_name: string;
  rules: string;
  mapped_prompts?: string[];
}

export interface UpdateCategory {
  category_id: string;
  category_name?: string;
  rules?: string;
  mapped_prompts?: string[];
}

export interface CategoryValidationError {
  category_name?: string;
  rules?: string;
  mapped_prompts?: string;
}

export interface CategoryState {
  categories: Category[];
  filteredCategories: Category[];
  editingId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  validationError: CategoryValidationError;
  previousCategoryState: Category | null;
}

export interface DeleteCategoriesRequest {
  userId: string;
  categoryIds: string[];
}

export interface DeleteCategoryRequest {
  userId: string;
  categoryId: string;
}

export interface SaveCategoryRequest {
  category: NewCategory | UpdateCategory;
  userId: string;
}
