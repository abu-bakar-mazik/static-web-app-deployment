import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';
import { customBaseQuery } from '../lib/customBaseQuery';
interface ChatModelResponse {
  userModel: string;
  allModels: string[];
}
interface ChatModelState {
  selectedModel: string | null;
}
const initialState: ChatModelState = {
  selectedModel: null,
};
export const chatModelApi = createApi({
  reducerPath: 'ModelsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['ChatModel'],
  endpoints: (builder) => ({
    getAllModels: builder.query<ChatModelResponse, string>({
      query: (userId) => {
        return {
          url: '/getUserChatModel',
          method: 'GET',
          headers: { 'user-id': userId }
        }
      },
      providesTags: ['ChatModel'],
    }),
    updateChatModel: builder.mutation<string, { userId: string; modelName: string }>({
      query: ({ userId, modelName }) => ({
        url: `/setUserChatModel?model=${modelName}`,
        method: 'POST',
        headers: { 'user-id': userId },
      }),
      invalidatesTags: ['ChatModel'],
    }),
  }),
});

export const { useGetAllModelsQuery, useUpdateChatModelMutation } = chatModelApi;

const chatModelSlice = createSlice({
  name: 'chatModel',
  initialState,
  reducers: {
    setSelectedModel: (state, action: PayloadAction<string | null>) => {
      state.selectedModel = action.payload;
    },
    resetSelectedModel: (state) => {
      state.selectedModel = null;
    },
  },
}); 

export const { setSelectedModel, resetSelectedModel } = chatModelSlice.actions;
export const selectSelectedModel = (state: RootState) => state.chatModel.selectedModel;
export default chatModelSlice.reducer;