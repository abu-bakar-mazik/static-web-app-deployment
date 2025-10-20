import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer, { authApi } from '@/redux/slices/authSlice';
import promptsReducer, { promptsApi } from '@/redux/slices/promptsSlice';
import sessionReducer, { sessionApi } from '@/redux/slices/sessionSlice';
import chatShareReducer, { chatShareApi } from '@/redux/slices/chatShareSlice';
import chatModelReducer, { chatModelApi } from '@/redux/slices/ModelSlice';
import chatHistoryReducer, { chatHistoryApi } from '@/redux/slices/chatHistorySlice';
import adminReducer, { adminApi } from '@/redux/slices/adminSlice';
import chatReducer, { chatApi } from '@/redux/slices/chatSlice';
import documentReducer, { fileUploadApi } from '@/redux/slices/fileUploadSlice';
import selectedDocsReducer from '@/redux/slices/SelectedDocsSlice';
import { persistDocsMiddleware } from '@/redux/middleware/selectedDocsMiddleware';
import { setupListeners } from '@reduxjs/toolkit/query';
// import { logoApi } from './slices/logoSlice';
import { timeoutMiddleware } from './middleware/timeoutMiddleware';
import batchReducer, { batchApi } from './slices/batchSlice';
import categoriesReducer, { categoriesApi } from '@/redux/slices/categoriesSlice';
import { batchAutomationApi } from '@/redux/slices/batchAutomationSlice';
import { fileShareFoldersApi } from '@/redux/slices/fileShareFoldersSlice';

const store = configureStore({
  reducer: {
    // Feature reducers
    sessions: sessionReducer,
    prompts: promptsReducer,
    chatShare: chatShareReducer,
    chatModel: chatModelReducer,
    selectedDocs: selectedDocsReducer,
    chatHistory: chatHistoryReducer,
    chat: chatReducer,
    auth: authReducer,
    doc: documentReducer,
    batch: batchReducer,
    admin: adminReducer,
    categories: categoriesReducer,
    // API reducers
    [sessionApi.reducerPath]: sessionApi.reducer,
    [promptsApi.reducerPath]: promptsApi.reducer,
    [chatShareApi.reducerPath]: chatShareApi.reducer,
    [chatModelApi.reducerPath]: chatModelApi.reducer,
    // [logoApi.reducerPath]: logoApi.reducer,
    [chatHistoryApi.reducerPath]: chatHistoryApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [fileUploadApi.reducerPath]: fileUploadApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [batchApi.reducerPath]: batchApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [batchAutomationApi.reducerPath]: batchAutomationApi.reducer,
    [fileShareFoldersApi.reducerPath]: fileShareFoldersApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      thunk: true,
      immutableCheck: false,
      serializableCheck: false,
    }).concat(
      sessionApi.middleware,
      promptsApi.middleware,
      chatShareApi.middleware,
      chatModelApi.middleware,
      persistDocsMiddleware,
      // logoApi.middleware,
      chatHistoryApi.middleware,
      chatApi.middleware,
      authApi.middleware,
      fileUploadApi.middleware,
      adminApi.middleware,
      batchApi.middleware,
      categoriesApi.middleware,
      batchAutomationApi.middleware,
      fileShareFoldersApi.middleware,
      timeoutMiddleware,
    );
  },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export { store };
