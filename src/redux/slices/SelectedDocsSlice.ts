import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { FetchDocument } from '@/types/doc-types';
interface SelectedDocsState {
  documents: FetchDocument[];
  isInitialized: boolean;
}
const initialState: SelectedDocsState = {
  documents: [],
  isInitialized: false
};
const selectedDocsSlice = createSlice({
  name: 'selectedDocs',
  initialState,
  reducers: {
    initializeState: (state, action: PayloadAction<FetchDocument[]>) => {
      if (!state.isInitialized) {
        state.documents = action.payload;
        state.isInitialized = true;
      }
    },
    addDocument: (state, action: PayloadAction<FetchDocument>) => {
      state.documents.push(action.payload);
      if (state.isInitialized) {
        try {
          sessionStorage.setItem('selectedDocs', JSON.stringify(state.documents));
        } catch (error) {
          console.log('Error saving to sessionStorage:', error);
        }
      }
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
      if (state.isInitialized) {
        try {
          sessionStorage.setItem('selectedDocs', JSON.stringify(state.documents));
        } catch (error) {
          console.log('Error saving to sessionStorage:', error);
        }
      }
    },
    clearDocuments: (state) => {
      state.documents = [];
      if (state.isInitialized) {
        try {
          sessionStorage.setItem('selectedDocs', JSON.stringify(state.documents));
        } catch (error) {
          console.log('Error saving to sessionStorage:', error);
        }
      }
    }
  },
});
export const { initializeState, addDocument, removeDocument, clearDocuments } = selectedDocsSlice.actions;
export const selectAllDocuments = (state: RootState) => state.selectedDocs.documents;
export default selectedDocsSlice.reducer;