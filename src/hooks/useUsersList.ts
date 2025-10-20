import { useState, useCallback } from 'react';
import { useFetchUsersQuery } from '@/redux/slices/adminSlice';
import { useAuth } from './useAuth';
export const useSharePrompt = () => {
  const { userId } = useAuth();
  const skipQuery = !userId;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    error: usersError
  } = useFetchUsersQuery(userId || '', {
    skip: skipQuery,
  });
  const users = usersResponse?.users || [];
  const openShareModal = useCallback((promptId: string) => {
    setCurrentPromptId(promptId);
    setSelectedUsers([]);
    setIsModalOpen(true);
  }, []);
  const closeShareModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentPromptId(null);
    setSelectedUsers([]);
  }, []);
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);
  const selectAllUsers = useCallback(() => {
    setSelectedUsers(users.map(user => user.userid));
  }, [users]);
  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);
  return {
    isModalOpen,
    openShareModal,
    closeShareModal,
    users,
    isLoadingUsers,
    usersError,
    selectedUsers,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    currentPromptId,
  };
};