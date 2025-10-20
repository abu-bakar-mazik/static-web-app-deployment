import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';
import { IdTokenClaims } from '@/types/types';
import { AccountInfo } from '@azure/msal-browser';
import { RootState } from '@/redux/store';
import { customBaseQuery } from '../lib/customBaseQuery';
interface CustomAccountInfo extends Omit<AccountInfo, 'tenantProfiles'> {
  tenantProfiles: Record<string, Partial<TenantProfile>>;
}
interface Session {
  _ts: number;
  chat_id: string;
  title: string;
  filename: string | null;
  fileid: string[];
  have_file: boolean;
}
interface TenantProfile {
  tenantId: string;
  environment: string;
  homeAccountId: string;
  localAccountId: string;
  username: string;
  name?: string;
  claims?: {
    aud: string;
    iss: string;
    iat: number;
    nbf: number;
    exp: number;
    roles?: string[];
    groups?: string[];
    [key: string]: any;
  };
}
interface RenamePayload {
  chat_id: string;
  new_title: string;
}
interface SessionState {
  sessions: Session[];
  userRole: string | null;
  userId: string | null;
  idTokenClaims?: IdTokenClaims | null;
  userAccount?: CustomAccountInfo | null;
  tenantProfiles: Record<string, TenantProfile>;
  loading: boolean;
  error: string | null;
  newName: string;
  editingConversationId: string | null;
}
const initialState: SessionState = {
  sessions: [],
  userRole: null,
  userId: null,
  idTokenClaims: null,
  userAccount: null,
  tenantProfiles: {},
  loading: false,
  error: null,
  newName: '',
  editingConversationId: null,
};
export const sessionApi = createApi({
  reducerPath: 'fetchSessions',
  baseQuery: customBaseQuery,
  tagTypes: ['Sessions'],
  endpoints: (builder) => ({
    getAllSessions: builder.query<Session[], string>({
      query: (userId) => {
        return {
          url: '/getAllChats',
          method: 'POST',
          body: JSON.stringify(userId),
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        };
      },
      transformResponse: (response: { history: Session[] }) => response.history,
      providesTags: (result) => (result ? [...result.map(({ chat_id }) => ({ type: 'Sessions' as const, id: chat_id })), { type: 'Sessions', id: 'LIST' }] : [{ type: 'Sessions', id: 'LIST' }]),
    }),
    deleteChat: builder.mutation<{ history?: string }, { chatId: string; userId: string }>({
      query: ({ chatId, userId }) => ({
        url: '/deleteChatByChatId',
        method: 'DELETE',
        headers: {
          accept: 'application/json',
          'chat-id': chatId,
          'user-id': userId,
        },
      }),
      invalidatesTags: ['Sessions'],
    }),
    renameChat: builder.mutation<void, RenamePayload>({
      query: (payload) => ({
        url: '/renameChat',
        method: 'PUT',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      }),
      invalidatesTags: ['Sessions'],
    }),
  }),
});
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setIdTokenClaims: (state, action: PayloadAction<IdTokenClaims | null>) => {
      state.idTokenClaims = action.payload;
    },
    setUserAccount: (state, action: PayloadAction<AccountInfo | null>) => {
      if (action.payload) {
        const account = { ...action.payload } as unknown as CustomAccountInfo;
        if (action.payload.tenantProfiles instanceof Map) {
          account.tenantProfiles = Object.fromEntries(action.payload.tenantProfiles);
        }
        state.userAccount = account;
        if (account?.localAccountId) {
          const tokenClaimsRoles = account.idTokenClaims?.roles
          state.userId = account.localAccountId;
          if (tokenClaimsRoles) {
            state.userRole = tokenClaimsRoles?.[0];
            sessionStorage.setItem('userRole', tokenClaimsRoles?.[0])
          }
          sessionStorage.setItem('userAccount', JSON.stringify(account));
          sessionStorage.setItem('userId', account.localAccountId);
        }
      }
    },
    initializeFromStorage: (state) => {
      const storedUserAccount = sessionStorage.getItem('userAccount');
      const storedUserId = sessionStorage.getItem('userId');
      const storedUserRole = sessionStorage.getItem('userRole');
      if (storedUserAccount && storedUserId && storedUserRole) {
        state.userAccount = JSON.parse(storedUserAccount);
        state.userId = storedUserId;
        state.userRole = storedUserRole;
      }
    },
    setNewName: (state, action: PayloadAction<string>) => {
      state.newName = action.payload;
    },
    setEditingConversationId: (state, action: PayloadAction<string | null>) => {
      state.editingConversationId = action.payload;
    },
  },
});
export const selectUserId = (state: RootState) => state.sessions.userId;
export const selectUserAccount = (state: RootState) => state.sessions.userAccount;
export const selectUserRole = (state: RootState) => state.sessions.userRole;
export const selectIdTokenClaims = (state: RootState) => state.sessions.idTokenClaims;
export const { setIdTokenClaims, setUserAccount, initializeFromStorage, setNewName, setEditingConversationId } = sessionSlice.actions;
export const { useGetAllSessionsQuery, useDeleteChatMutation, useRenameChatMutation } = sessionApi;
export default sessionSlice.reducer;
