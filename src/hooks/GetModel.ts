import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllModelsQuery, useUpdateChatModelMutation, setSelectedModel, resetSelectedModel, selectSelectedModel } from '@/redux/slices/ModelSlice';
import { useAuth } from '@/hooks/useAuth';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import { toaster } from '@/components/ui/toaster';
export const useChatModel = () => {
  const dispatch = useDispatch();
  const { userId } = useAuth();
  const { isAuthenticated, userAuthenticated } = useMsalAuthHelper();
  const selectedModel = useSelector(selectSelectedModel);
  const { data, isLoading, refetch } = useGetAllModelsQuery(userId ?? '', {
    skip: !userId || !userAuthenticated,
  });
  const [updateModel, { isLoading: isUpdating }] = useUpdateChatModelMutation();
  useEffect(() => {
    if (data?.userModel && selectedModel === null) {
      dispatch(setSelectedModel(data.userModel));
    }
  }, [data?.userModel, selectedModel, dispatch]);
  useEffect(() => {
    if (!userId || !isAuthenticated) {
      dispatch(resetSelectedModel());
    }
  }, [userId, isAuthenticated, dispatch]);
  const handleModelChange = async (modelName: string) => {
    if (modelName !== selectedModel && userId) {
      try {
        await updateModel({ userId, modelName }).unwrap();
        dispatch(setSelectedModel(modelName));
        toaster.create({
          title: 'Model updated',
          type: 'success',
        });
      } catch (error: any) {
        console.log('Model update failed:', error);
        toaster.create({
          title: 'Error updating model',
          description: error?.data?.message || error.message || 'Unknown error',
          type: 'error',
        });
      }
    }
  };
  return {
    models: data?.allModels || [],
    selectedModel: selectedModel || data?.userModel || null,
    handleModelChange,
    refetchChatModels: refetch,
    isLoading,
    isUpdating,
  };
};
