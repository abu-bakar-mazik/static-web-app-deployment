import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { useChatModel } from '@/hooks/GetModel';
import { useSelectedDocs } from './SelectedDocs';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { resetChatHistory, setActiveConversationId, setChatHistory, setFileName } from '@/redux/slices/chatHistorySlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  setInputCodeAction,
  setOutputCode,
  setChatId,
  setUserSelectedFiles,
  setInputOnSubmit,
  setUserToken,
  setError,
  setIsLoading,
  useSendChatMessageMutation,
  resetChat
} from '@/redux/slices/chatSlice';
import { useGetAllSessionsQuery } from '@/redux/slices/sessionSlice';
interface Message {
  content: string;
  role: string;
  citation?: Array<{ content: string; title: string }>;
}
export const useChatTranslate = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { selectedDocs } = useSelectedDocs();
  const { userId } = useAuth();
  const { selectedModel } = useChatModel();
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation();
  const { chatHistory } = useSelector((state: RootState) => state.chatHistory);
  const { inputCode, outputCode, chat_id, userSelectedFiles, inputOnSubmit, userToken } = useSelector(
    (state: RootState) => state.chat
  );
  const { data: sessions, refetch: refetchSessions } = useGetAllSessionsQuery(userId || '', {
    skip: !userId,
  });
  const [isNavigating, startTransition] = useTransition();
  // Track the URL chat_id separately
  const urlChatId = params?.chat_id as string | undefined;
  // Sync URL chat_id with the redux store when it changes
  useEffect(() => {
    if (urlChatId && urlChatId !== chat_id) {
      dispatch(setChatId(urlChatId));
    }
  }, [urlChatId, chat_id, dispatch]);
  useEffect(() => {
    if (isLoading !== undefined) {
      dispatch(setIsLoading(isLoading));
    }
  }, [isLoading, dispatch]);
  const handleTranslateAction = useCallback(async (promptText?: string, chatIdOverride?: string) => {
    try {
      dispatch(setError(null));
      const input = promptText ?? inputCode;
      if (!input) {
        alert('Please enter your message.');
        return;
      }
      dispatch(setInputOnSubmit(input));
      dispatch(setInputCodeAction(''));
      const effectiveChatId = pathname === '/' ? '' : (urlChatId || chatIdOverride || chat_id);

      console.log("Path:", pathname);
      console.log("Chosen chat_id for API:", effectiveChatId);
      const userMessage: Message = {
        role: 'user',
        content: input,
      };
      const updatedHistory = [...chatHistory, userMessage];
      dispatch(setChatHistory(updatedHistory));
      dispatch(setOutputCode(' '));
      const selectedFileIds = JSON.parse(localStorage.getItem('selectedFileIds') || '[]');
      const selectedDocsData = selectedDocs.map((doc) => doc.id);
      const body = {
        inputCode: input,
        model: selectedModel,
        user_id: userId!,
        file_id: selectedFileIds.length > 0 && selectedFileIds.length < 2 ? selectedFileIds[0] : undefined,
        file_ids: selectedDocsData.length > 0 ? selectedDocsData : undefined,
        chat_id: effectiveChatId,
        token: { input: 0, output: 0, total: 0 },
      };
      const response = await sendChatMessage(body).unwrap();
      if (!effectiveChatId) {
        if (response.history.chat_id && !urlChatId) {
          router.push(`/chat/${response.history.chat_id}`);
        }
        try {
          await refetchSessions();
          // If this was a new chat, update the URL to include the new chat_id
        } catch (refetchError) {
          console.warn("Error refetching sessions:", refetchError);
        }
      }
      if (response.history?.History && response.history.History.length > 0) {
        // Update chat history with the complete history from API response
        dispatch(setChatHistory(response.history.History));
      }
      dispatch(setOutputCode(response.response));
      dispatch(setChatId(response.history.chat_id));
      dispatch(setUserSelectedFiles(response.history.fileid || []));
      dispatch(setUserToken(response.history.token.total ?? 0));
      if (response.history.filename) {
        dispatch(setFileName(response.history.filename));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch(setError(errorMessage));
      console.log('Error:', errorMessage);
    }
  }, [dispatch, inputCode, chat_id, urlChatId, selectedDocs, selectedModel, userId, sendChatMessage, chatHistory, router, refetchSessions]);
  const storeCurrentRoute = useCallback(async (path: string) => {
    if (pathname?.includes('chat') && path !== '/') {
      sessionStorage.setItem('previousRoute', pathname);
    } else if (path === '/') {
      sessionStorage.removeItem('previousRoute');
    }
  }, [pathname]);
  const goToPreviousRoute = useCallback(async (routepath: string) => {
    if (isNavigating) return;
    startTransition(() => {
      const storedPreviousRoute = sessionStorage.getItem('previousRoute');
      if (routepath === '/' && storedPreviousRoute) {
        if (pathname.includes('/chat')) {
          dispatch(resetChatHistory());
          dispatch(resetChat());
          sessionStorage.removeItem('previousRoute');
          dispatch(setActiveConversationId(''))
          router.push('/');
          return;
        }
        router.push(storedPreviousRoute);
        return;
      } else {
        router.push(routepath);
      }
    });
  }, [router, pathname, selectedDocs.length, dispatch, isNavigating]);
  useEffect(() => {
    storeCurrentRoute(pathname);
  }, [pathname, storeCurrentRoute]);
  return {
    outputCode,
    inputCode,
    setInputCodeAction: (value: string) => dispatch(setInputCodeAction(value)),
    chatHistory,
    inputOnSubmit,
    userToken,
    chat_id: urlChatId || chat_id, // Prioritize URL chat_id over redux store
    isLoading,
    handleTranslateAction,
    goToPreviousRoute,
    userSelectedFiles,
    isNavigating,
  };
};