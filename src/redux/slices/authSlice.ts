import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '@/redux/lib/customBaseQuery';
interface UserProfile {
  localAccountId: string;
  email: string;
  display_name: string;
  roles: string[];
}
interface AuthenticateUserResponse {
  success: boolean;
  message?: string;
  user_id?: string;
  email?: string;
  display_name?: string;
  roles?: string[];
  error?: string;
}
interface AuthState {
  userAuthenticated: boolean;
  authSession: AuthenticateUserResponse | null;
  isLoading: boolean;
  error: string | null;
}
const initialState: AuthState = {
  userAuthenticated: false,
  authSession: null,
  isLoading: false,
  error: null,
};
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    authenticateUser: builder.mutation<AuthenticateUserResponse, UserProfile>({
      query: (userProfile) => ({
        url: '/auth/authenticateUser',
        method: 'POST',
        body: userProfile,
        headers: { 'Content-Type': 'application/json' }
      }),
      invalidatesTags: ['Auth'],
    })
  })
});
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.userAuthenticated = action.payload;
      state.error = null;
    },
    setAuthSession: (state, action: PayloadAction<AuthenticateUserResponse>) => {
      state.authSession = action.payload;
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAuth: (state) => {
      state.userAuthenticated = false;
      state.authSession = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.authenticateUser.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.authenticateUser.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.authSession = action.payload;
        state.userAuthenticated = action.payload.success;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.authenticateUser.matchRejected, (state, action) => {
        state.isLoading = false;
        state.userAuthenticated = false;
        state.error = action.error.message || 'Authentication failed';
      });
  },
});
export const { useAuthenticateUserMutation } = authApi;
export const {
  setUserAuthenticated,
  setAuthSession,
  setAuthLoading,
  setAuthError,
  clearAuth
} = authSlice.actions;
export default authSlice.reducer;
export type { UserProfile, AuthenticateUserResponse };