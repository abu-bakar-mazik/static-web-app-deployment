'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setSessionHistories, setChatHistory, setActiveConversationId, useGetChatHistoryMutation, setIsSHLoading, setFileName } from '@/redux/slices/chatHistorySlice';
import { RootState } from '@/redux/store';
export const useChatHistory = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { sessionHistories, chatHistory, historyTitle, activeConversationId, isSHLoading } = useSelector((state: RootState) => state.chatHistory);
  const [getChatHistory] = useGetChatHistoryMutation();
  const [lastLoadedSessionId, setLastLoadedSessionId] = useState<string | null>(null);
  const handleConversationClick = useCallback(async (chatId: string) => {
    if (chatId === lastLoadedSessionId) {
      return;
    }
    try {
      setLastLoadedSessionId(chatId);
      dispatch(setIsSHLoading(true));
      const response = await getChatHistory(chatId).unwrap();
      if (response) {
        dispatch(setChatHistory(response.messages));
        dispatch(setSessionHistories({ chatId, history: response.messages }));
        router.push(`/chat/${chatId}`);
        dispatch(setActiveConversationId(chatId));
        if (response.fileName) {
          dispatch(setFileName(response.fileName || ''));
        }
      }
    } catch (error) {
      console.log('Error fetching chat history:', error);
    }
  }, [dispatch, router, getChatHistory]);
  useEffect(() => {
    if (activeConversationId) {
      setLastLoadedSessionId(activeConversationId);
    }
  }, [activeConversationId]);
  return {
    sessionHistories,
    chatHistory,
    historyTitle,
    activeConversationId,
    isSHLoading,
    handleConversationClick,
    lastLoadedSessionId
  };
};
