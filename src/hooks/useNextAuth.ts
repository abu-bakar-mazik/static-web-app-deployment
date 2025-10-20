// import { useSession, signIn, signOut } from 'next-auth/react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toaster } from '@/components/ui/toaster';
// import { useDeleteChatMutation } from '@/redux/slices/sessionSlice';
// import { setUserAuthenticated, setAuthSession } from '@/redux/slices/authSlice';
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export const useAuth = () => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [deleteChat, { isLoading }] = useDeleteChatMutation();

//   useEffect(() => {
//     if (session) {
//       dispatch(setUserAuthenticated(true));
//       dispatch(setAuthSession(session));
//     } else {
//       dispatch(setUserAuthenticated(false));
//       dispatch(setAuthSession(null));
//     }
//   }, [session, dispatch]);

//   const handleLogin = async (callbackUrl = '/') => {
//     try {
//       await signIn('azure-ad', { callbackUrl });
//     } catch (error) {
//       console.error('Login failed:', error);
//       toaster.create({
//         title: 'Login failed',
//         type: 'error'
//       });
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
//       sessionStorage.clear();
//       await signOut({ callbackUrl: '/auth/signout' });
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   const handleDeleteChat = async (chatId: string) => {
//     if (!session?.user?.id) return;
    
//     try {
//       await deleteChat({ chatId, userId: session.user.id }).unwrap();
//       toaster.create({
//         title: 'Conversation deleted successfully.',
//         type: 'success',
//       });
//     } catch (error) {
//       toaster.create({
//         title: 'An error occurred.',
//         description: 'Unable to delete the chat.',
//         type: 'error',
//       });
//       console.error('Error deleting chat:', error);
//     }
//   };

//   return {
//     session,
//     status,
//     isAuthenticated: status === 'authenticated',
//     userId: session?.user?.id,
//     handleLogin,
//     handleLogout,
//     handleDeleteChat,
//     isLoading,
//   };
// };