'use client';
import { useParams } from 'next/navigation';
import { useSelectedDocs } from '@/hooks/SelectedDocs';
import { useChatTranslate } from '@/hooks/chat';
import { useChatHistory } from '@/hooks/chatHistory';
import { useGetAllPromptsQuery, selectFilteredPrompts } from '@/redux/slices/promptsSlice';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { ChatComponent } from '@/components/ChatComponent';
import { useEffect, useState } from 'react';
import { setChatId } from '@/redux/slices/chatSlice';

export default function ChatPage() {
  const params = useParams();
  const chat_id = params?.chat_id as string | undefined;
  const dispatch = useDispatch();
  const { userId } = useAuth();
  const skipQuery = !userId;
  const { data: promptsData } = useGetAllPromptsQuery(userId || '', {
    skip: skipQuery,
  });
  const prompts = promptsData || [];
  const { handleConversationClick, lastLoadedSessionId } = useChatHistory();
  const { selectedDocs } = useSelectedDocs();
  const { handleTranslateAction, outputCode, inputCode, setInputCodeAction, isLoading, chatHistory, userToken } = useChatTranslate();
  const [userIdLoaded, setUserIdLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (chat_id) {
      dispatch(setChatId(chat_id));
    }
  }, [chat_id, dispatch]);
  useEffect(() => {
    if (userId) {
      setUserIdLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    if (userIdLoaded && chat_id && !lastLoadedSessionId) {
      console.log('chat_id page')
      handleConversationClick(chat_id as string);
    }
  }, [chat_id, userIdLoaded, handleConversationClick]);

  return (
    <ChatComponent
      isAuthenticated={true}
      prompts={prompts}
      selectedDocs={selectedDocs}
      handleTranslateAction={handleTranslateAction}
      outputCode={outputCode}
      inputCode={inputCode}
      setInputCodeAction={setInputCodeAction}
      isLoading={isLoading}
      chatHistory={chatHistory}
      userToken={userToken}
      chatId={chat_id}
    />
  );
}