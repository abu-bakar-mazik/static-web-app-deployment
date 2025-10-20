import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../lib/customBaseQuery';
interface ShareChatResponse {
  shareLink: string;
}
interface ShareChatParams {
  chatId: string;
  userId: string;
}
interface ShareState {
  isShareModalOpen: boolean;
  chatId: string;
  shareLink: string;
}
const initialState: ShareState = {
  isShareModalOpen: false,
  chatId: '',
  shareLink: '',
};
export const chatShareApi = createApi({
  reducerPath: 'chatShareApi',
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    generateShareLink: builder.mutation<ShareChatResponse, ShareChatParams>({
      query: ({ chatId, userId }) => ({
        url: `shareChat`,
        method: 'POST',
        params: { chat_id: chatId },
        headers: {
          'user-id': userId,
        },
      }),
      transformResponse: (response: any, meta, arg) => {
        return {
          shareLink: `${window.location.origin}/share/${arg.chatId}`,
        };
      },
    }),
  }),
});
const chatShareSlice = createSlice({
  name: 'chatShare',
  initialState,
  reducers: {
    openShareModal: (state, action: PayloadAction<string>) => {
      state.chatId = action.payload;
      state.isShareModalOpen = true;
      // console.log('Opening share modal for chat:', state.chatId);
    },
    closeShareModal: (state) => {
      state.isShareModalOpen = false;
      state.chatId = '';
      state.shareLink = '';
    },
    copyShareLink: (state) => {
      if (state.shareLink) {
        navigator.clipboard.writeText(state.shareLink);
      }
    },
    setShareLink: (state, action: PayloadAction<string>) => {
      state.shareLink = action.payload;
    },
    clearShareLink: (state) => {
      state.shareLink = '';
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      chatShareApi.endpoints.generateShareLink.matchFulfilled,
      (state, action) => {
        state.shareLink = action.payload.shareLink;
      }
    );
  },
});
export const {
  useGenerateShareLinkMutation
} = chatShareApi;
export const {
  openShareModal,
  closeShareModal,
  copyShareLink,
  setShareLink,
  clearShareLink
} = chatShareSlice.actions;
export default chatShareSlice.reducer;