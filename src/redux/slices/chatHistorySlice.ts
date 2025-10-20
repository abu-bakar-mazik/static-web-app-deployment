import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../lib/customBaseQuery';
interface Message {
  content: string;
  role: string;
  citation?: Array<{ content: string; title: string }>;
}
interface ChatHistory {
  title: string;
  History: Message[];
  fileid?: string;
  filename?: string;
}
interface ChatHistoryResponse {
  history: ChatHistory[];
}
interface ChatHistoryState {
  sessionHistories: { [chatId: string]: Message[] };
  chatHistory: Message[];
  historyTitle: string;
  activeConversationId: string;
  isSHLoading: boolean;
  error: string | null;
  fileId: string | null;
  fileName: string | null;
}
const initialState: ChatHistoryState = {
  sessionHistories: {},
  chatHistory: [],
  historyTitle: '',
  activeConversationId: '',
  isSHLoading: false,
  error: null,
  fileId: null,
  fileName: null,
};
interface ChatHistoryResult {
  messages: Message[];
  fileId: string | null;
  fileName: string | null;
}
export const chatHistoryApi = createApi({
  reducerPath: 'fetchChatHistory',
  baseQuery: customBaseQuery,
  tagTypes: ['ChatHistory'],
  endpoints: (builder) => ({
    getChatHistory: builder.mutation<ChatHistoryResult, string>({
      query: (chatId) => {
        return {
          url: '/getChatByChatId',
          method: 'POST',
          body: { chat_id: chatId },
          headers: { 'Content-Type': 'application/json', 'accept': 'application/json' }
        }
      },
      transformResponse: (response: ChatHistoryResponse): ChatHistoryResult => {
        const fileId = response.history[0]?.fileid !== undefined && response.history[0]?.fileid !== null
          ? String(response.history[0].fileid)
          : null;
        const fileName = response.history[0]?.filename !== undefined && response.history[0]?.filename !== null
          ? String(response.history[0].filename)
          : null;
        return {
          messages: response.history[0]?.History || [],
          fileId,
          fileName
        }
      }
    })
  }),
});
const chatHistorySlice = createSlice({
  name: 'ChatHistory',
  initialState,
  reducers: {
    setSessionHistories: (state, action: PayloadAction<{ chatId: string; history: Message[] }>) => {
      state.sessionHistories[action.payload.chatId] = action.payload.history;
    },
    setChatHistory: (state, action: PayloadAction<Message[]>) => {
      state.chatHistory = action.payload;
    },
    setHistoryTitle: (state, action: PayloadAction<string>) => {
      state.historyTitle = action.payload;
    },
    setActiveConversationId: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },
    setIsSHLoading: (state, action: PayloadAction<boolean>) => {
      state.isSHLoading = action.payload;
    },
    setFileId: (state, action: PayloadAction<string | null>) => {
      state.fileId = action.payload;
    },
    setFileName: (state, action: PayloadAction<string | null>) => {
      state.fileName = action.payload;
    },
    resetChatHistory: (state) => {
      state.chatHistory = [];
      state.fileId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(chatHistoryApi.endpoints.getChatHistory.matchPending, (state) => {
      state.isSHLoading = true;
    })
      .addMatcher(chatHistoryApi.endpoints.getChatHistory.matchFulfilled, (state, action) => {
        state.isSHLoading = false;
        state.chatHistory = action.payload.messages;
        state.fileId = action.payload.fileId;
        state.fileName = action.payload.fileName;
      })
      .addMatcher(chatHistoryApi.endpoints.getChatHistory.matchRejected, (state, action) => {
        state.isSHLoading = false;
        state.error = action.error.message || 'An error occurred while fetching prompts';
      })
  }
});
export const { useGetChatHistoryMutation } = chatHistoryApi;
export const {
  setSessionHistories,
  setChatHistory,
  setHistoryTitle,
  setActiveConversationId,
  setIsSHLoading,
  resetChatHistory,
  setFileId,
  setFileName,
} = chatHistorySlice.actions;
export default chatHistorySlice.reducer;