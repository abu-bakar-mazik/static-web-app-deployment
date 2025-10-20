import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';
import { ChatBody } from '@/types/types';
import { customBaseQuery } from '../lib/customBaseQuery';
interface Message {
  content: string;
  role: string;
  citation?: Array<{ content: string; title: string }>;
}
interface TokenUsage {
  input: number;
  output: number;
  total: number;
}
interface ChatHistoryItem {
  role: string;
  content: string;
  citation?: Array<{ content: string; title: string }>;
}
interface ChatHistory {
  id: string;
  chat_id: string;
  user_id: string;
  title: string;
  token: TokenUsage;
  chat_model: string;
  access: string;
  createdAt: string;
  History: ChatHistoryItem[];
  fileid?: string[];
  filename: string;
}
interface ChatResponse {
  response: string;
  history: ChatHistory;
}
interface ChatState {
  inputCode: string;
  outputCode: string;
  chat_id: string;
  inputOnSubmit: string,
  userSelectedFiles: string[];
  error: string | null;
  isLoading: boolean;
  userToken: number;
}
const initialState: ChatState = {
  inputCode: '',
  outputCode: '',
  chat_id: '',
  inputOnSubmit: '',
  userSelectedFiles: [],
  error: null,
  isLoading: false,
  userToken: 0,
};
export const chatApi = createApi({
  reducerPath: 'fetchChat',
  baseQuery: customBaseQuery,
  tagTypes: ['ChatApi'],
  endpoints: (builder) => ({
    sendChatMessage: builder.mutation<ChatResponse, ChatBody>({
      query: (body) => ({
        url: '/chatAPI',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }),
      invalidatesTags: ['ChatApi'],
    }),
  }),
});
const chatSlice = createSlice({
  name: 'Chat',
  initialState,
  reducers: {
    setInputCodeAction: (state, action: PayloadAction<string>) => {
      state.inputCode = action.payload;
    },
    setOutputCode: (state, action: PayloadAction<string>) => {
      state.outputCode = action.payload;
    },
    setChatId: (state, action: PayloadAction<string>) => {
      state.chat_id = action.payload;
    },
    setUserSelectedFiles: (state, action: PayloadAction<string[]>) => {
      state.userSelectedFiles = action.payload;
    },
    setInputOnSubmit: (state, action: PayloadAction<string>) => {
      state.inputOnSubmit = action.payload;
    },
    setUserToken: (state, action: PayloadAction<number>) => {
      state.userToken = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetChat: (state) => {
      state.chat_id = '';
      state.inputCode = '';
      state.outputCode = '';
      state.inputOnSubmit = '';
      state.error = null;
    },
  },
});
export const { useSendChatMessageMutation } = chatApi;
export const { setInputCodeAction, setOutputCode, setChatId, setInputOnSubmit, setUserToken, setUserSelectedFiles, setError, setIsLoading, resetChat } = chatSlice.actions;
export default chatSlice.reducer;