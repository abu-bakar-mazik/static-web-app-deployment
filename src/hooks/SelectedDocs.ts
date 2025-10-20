import { useDispatch, useSelector } from 'react-redux';
import { addDocument, removeDocument, clearDocuments, selectAllDocuments } from '@/redux/slices/SelectedDocsSlice';
import { FetchDocument } from '@/types/doc-types';
export const useSelectedDocs = () => {
  const dispatch = useDispatch();
  const selectedDocs = useSelector(selectAllDocuments);
  return { selectedDocs, addDoc: (doc: FetchDocument) => dispatch(addDocument(doc)), removeDoc: (docId: string) => dispatch(removeDocument(docId)), clearDocs: () => dispatch(clearDocuments()) };
};
