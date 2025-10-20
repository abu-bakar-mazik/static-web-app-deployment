'use client';
import { useSelectedDocs } from '@/hooks/SelectedDocs';
import { useChatTranslate } from '@/hooks/chat';
import { useGetAllPromptsQuery, selectFilteredPrompts } from '@/redux/slices/promptsSlice';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import { ChatComponent } from '@/components/ChatComponent';

interface Prompt {
  id: string;
  title: string;
  prompt: string[];
}

export default function MainPage() {
  const { userId } = useAuth();
  const skipQuery = !userId;
  const { data: promptsData } = useGetAllPromptsQuery(userId || '', {
    skip: skipQuery,
  });
  const prompts = promptsData || [];
  const { isAuthenticated } = useMsalAuthHelper();
  const { selectedDocs } = useSelectedDocs();
  const { handleTranslateAction, outputCode, inputCode, setInputCodeAction, isLoading, chatHistory, userToken } = useChatTranslate();

  return (
    <ChatComponent
      isAuthenticated={isAuthenticated ?? false}
      prompts={prompts}
      selectedDocs={selectedDocs}
      handleTranslateAction={handleTranslateAction}
      outputCode={outputCode}
      inputCode={inputCode}
      setInputCodeAction={setInputCodeAction}
      isLoading={isLoading}
      chatHistory={chatHistory}
      userToken={userToken}
      showWelcomeScreen={true}
    />
  );
}