import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import {
  useRemoveFromMyViewMutation
} from '@/redux/slices/promptsSlice';
export const useRemoveFromMyViewWithErrorHandling = () => {
  const [removeFromMyView, { isLoading }] = useRemoveFromMyViewMutation();
  const dispatch = useDispatch<AppDispatch>();
  const removeWithErrorHandling = async (
    userId: string,
    promptId: string,
    action: 'hide' | 'unhide'
  ) => {
    try {
      const result = await removeFromMyView({
        userId,
        removeRequest: { prompt_id: promptId, action }
      }).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorType: error.data?.errorType || 'SERVER_ERROR'
      };
    }
  };
  return { removeWithErrorHandling, isLoading };
};