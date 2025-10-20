import { useDispatch, useSelector } from 'react-redux';
import { toaster } from '@/components/ui/toaster';
import { RootState } from '@/redux/store';
import {
  selectUserId,
  selectUserAccount,
  selectIdTokenClaims,
  setIdTokenClaims,
  setUserAccount,
  selectUserRole,
  useDeleteChatMutation
} from '@/redux/slices/sessionSlice';
import { IdTokenClaims } from '@/types/types';
import { AccountInfo } from '@azure/msal-browser';
export const useAuth = () => {
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);
  const userId = useSelector(selectUserId);
  const userAccount = useSelector(selectUserAccount);
  const idTokenClaims = useSelector(selectIdTokenClaims);
  const authState = useSelector((state: RootState) => state.auth);
  const [deleteChat, { isLoading: isDeletingChat }] = useDeleteChatMutation();
  const handleSetIdTokenClaim = (claims: IdTokenClaims | null) => {
    dispatch(setIdTokenClaims(claims));
  };
  const handleSetUserAccount = (account: AccountInfo | null) => {
    dispatch(setUserAccount(account));
  };
  const handleDeleteChat = async (chatId: string) => {
    if (!userId) {
      toaster.create({
        title: 'Authentication required',
        description: 'Please log in to delete chats.',
        type: 'error',
      });
      return;
    }
    try {
      await deleteChat({ chatId, userId }).unwrap();
      toaster.create({
        title: 'Success',
        description: 'Conversation deleted successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toaster.create({
        title: 'Error',
        description: 'Unable to delete the chat. Please try again.',
        type: 'error',
      });
    }
  };
  const isFullyAuthenticated = authState.userAuthenticated && authState.authSession?.success;
  const userEmail = authState.authSession?.email || idTokenClaims?.email || userAccount?.username;
  const displayName = authState.authSession?.display_name || idTokenClaims?.name || userAccount?.name;
  const userRoles = authState.authSession?.roles || idTokenClaims?.roles || [];
  return {
    userId,
    userEmail,
    displayName,
    userRole,
    userRoles,
    userAccount,
    idTokenClaims,
    isAuthenticated: authState.userAuthenticated,
    isFullyAuthenticated,
    authSession: authState.authSession,
    authError: authState.error,
    isAuthLoading: authState.isLoading,
    setIdTokenClaims: handleSetIdTokenClaim,
    setUserAccount: handleSetUserAccount,
    handleDeleteChat,
    isDeletingChat,
  };
};