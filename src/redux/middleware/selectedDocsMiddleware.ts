import { Middleware } from '@reduxjs/toolkit';
interface StateWithSelectedDocs {
  selectedDocs: {
    documents: Array<{
      id: string;
      name: string;
      filename: string;
      date: string;
    }>;
  };
}
interface ReduxAction {
  type: string;
  [key: string]: any;
}
export const persistDocsMiddleware: Middleware<{}, StateWithSelectedDocs> = store => next => action => {
  const result = next(action);
  if (typeof action === 'object' && action !== null && 'type' in action && typeof (action as ReduxAction).type === 'string') {
    const typedAction = action as ReduxAction;
    if (typedAction.type.startsWith('selectedDocs/')) {
      try {
        const state = store.getState();
        if (state?.selectedDocs?.documents) {
          const selectedDocs = state.selectedDocs.documents;
          if (Array.isArray(selectedDocs)) {
            sessionStorage.setItem('selectedDocs', JSON.stringify(selectedDocs));
            // console.log('Successfully saved docs to session storage:', selectedDocs);
          } else {
            console.warn('Selected docs is not an array:', selectedDocs);
          }
        } else {
          console.warn('Selected docs state is not properly initialized');
          sessionStorage.setItem('selectedDocs', JSON.stringify([]));
        }
      } catch (error) {
        console.log('Error writing to sessionStorage:', error);
        sessionStorage.setItem('selectedDocs', JSON.stringify([]));
      }
    }
  }
  return result;
};