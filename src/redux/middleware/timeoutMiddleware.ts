import { Middleware } from '@reduxjs/toolkit';

interface TimeoutPayload {
  error: string;
  originalType: string;
}

interface TimeoutAction {
  type: string;
  payload: TimeoutPayload;
}

// Helper to check if an action is a timeout action
const isTimeoutAction = (action: any): action is TimeoutAction => {
  return action.type.endsWith('/rejected') && 
         action.payload?.error &&
         action.payload?.originalType;
};

// Create the timeout middleware
export const timeoutMiddleware: Middleware = store => next => action => {
  // Only process timeout-related actions
  if (!isTimeoutAction(action)) {
    return next(action);
  }

  // Get the timeout payload
  const timeoutPayload = action.payload as TimeoutPayload;

  // Log the timeout error
  console.error('Request timeout:', timeoutPayload.error, {
    originalType: timeoutPayload.originalType,
    action: action.type
  });

  // Create a new action with timeout information
  const timeoutAction = {
    type: 'REQUEST_TIMEOUT',
    payload: {
      error: timeoutPayload.error,
      originalActionType: timeoutPayload.originalType,
      timestamp: Date.now()
    }
  };

  // Dispatch the timeout action first
  store.dispatch(timeoutAction);

  // Then continue with the original rejected action
  return next(action);
};

// Export action type for type safety
export const REQUEST_TIMEOUT = 'REQUEST_TIMEOUT';

// Export timeout action creator
export const createTimeoutAction = (error: string, originalType: string) => ({
  type: REQUEST_TIMEOUT,
  payload: {
    error,
    originalType,
    timestamp: Date.now()
  }
});