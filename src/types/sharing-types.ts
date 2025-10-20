import { Prompt } from './prompt-types';
export interface SharedPrompt extends Prompt {
  shared_by?: string;
  permission_level: 'owner' | 'read_only';
  shared_datetime?: string;
  is_owner: boolean;
  shared_with?: string[];
  is_shared?: boolean;
  last_modified_by?: string;
  visibility: 'private' | 'public';
  access_type?: 'owned' | 'shared' | 'public';
}
export interface User {
  user_id: string;
  email: string;
  display_name: string;
  department: string;
}
export interface SharingRelationship {
  id: string;
  prompt_id: string;
  owner_id: string;
  shared_user_id: string;
  permission_level: string;
  shared_datetime: string;
  status: 'active' | 'inactive';
}
export interface SharedUser {
  user_id: string;
  permission_level: string;
  shared_datetime: string;
}
export interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
  department: string;
  default_model: string;
  sharing_preferences: SharingPreferences;
}
export interface SharingPreferences {
  auto_accept_shares: boolean;
  notification_enabled: boolean;
}
export interface SharingActivity {
  id: string;
  prompt_id: string;
  action: 'shared' | 'unshared' | 'accessed' | 'modified';
  performed_by: string;
  target_user: string;
  timestamp: string;
  details: string;
}
export interface SharePromptRequest {
  prompt_id: string;
  shared_user_ids: string[];
  permission_level?: string;
}
export interface SharePromptResponse {
  status: 'success' | 'warning' | 'partial_success' | 'info';
  message: string;
  sharing_records: SharingRelationship[];
  already_shared_users?: string[];
  newly_shared_users?: string[];
}
export interface SearchUsersResponse {
  users: User[];
  total_count: number;
}
export interface DuplicatePromptRequest {
  source_prompt_id: string;
  new_title?: string; 
  new_prompts?: string[]; 
}
export interface DuplicatePromptResponse {
  status: string;
  message: string;
  duplicated_prompt: SharedPrompt;
  original_prompt_id: string;
  new_prompt_id: string;
  duplication_metadata: {
    original_title: string;
    new_title: string;
    original_prompts_count: number;
    new_prompts_count: number;
    access_type: string;
    duplicated_datetime: string;
    customizations_applied: {
      title_customized: boolean;
      prompts_customized: boolean;
    };
  };
}
export interface SharingActivityResponse {
  activities: SharingActivity[];
  total_count: number;
}
