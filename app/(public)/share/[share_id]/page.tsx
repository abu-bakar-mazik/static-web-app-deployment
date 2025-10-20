'use client';
import MessageBoxChat from '@/components/MessageBox';
import {Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HttpClient } from '@/utils/httpClient';
interface ChatHistory {
  content: string;
  role: string;
}
interface SharePublicChatResponse {
  history: {
    history: ChatHistory[];
  },
  response: string;
}
export default function Chat() {
  const { share_id } = useParams();
  const [outputCode, setOutputCode] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ content: string; role: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [userSelectedFiles, setUserSelectedFiles] = useState<string[] | null>([]);

  const fetchChatHistory = async (share_id: string, user_id: string) => {
    setIsLoading(true);
    try {
      const response = await HttpClient.clientGet<SharePublicChatResponse>(`/auth/sharePublicChat?chat_id=${share_id}`, {
        headers: {
          'user-id': 'public',
        },
      });
      if (response.history?.history && response.history.history.length > 0) {
        setChatHistory(response.history.history);
      } else {
        console.warn('No chat history found.');
        setChatHistory([]);
      }
    } catch (error) {
      console.log('Error fetching chat history:', error);
      setChatHistory([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (share_id) {
      const user_id = sessionStorage.getItem('user_id');
      fetchChatHistory(share_id as string, user_id as string);
    }
  }, [share_id]);
  return (
    <Flex w="100%" pt={{ base: '70px', md: '0px' }} direction="column" position="relative">
      <Flex direction="column" mx="auto" w={{ base: '100%', md: '100%', xl: '100%' }} minH={{ base: '75vh', '2xl': '85vh' }} maxW="1000px">
        <Flex direction="column" w="100%" mx="auto" display={chatHistory.length > 0 ? 'flex' : 'none'} mb={'auto'}>
          <MessageBoxChat isLoading={isLoading} output={outputCode} chatHistory={chatHistory} isCitationOpen={isCitationOpen} setIsCitationOpen={setIsCitationOpen} />
        </Flex>
      </Flex>
    </Flex>
  );
}
