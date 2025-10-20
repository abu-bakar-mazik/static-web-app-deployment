import React from 'react';
import { Input, VStack, HStack } from '@chakra-ui/react';
import { IoCopySharp, IoShareSocial } from 'react-icons/io5';
import { Button } from './ui/button';
import { toaster } from './ui/toaster';
import { InputGroup } from './ui/input-group';
import { DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot, DialogTitle } from './ui/dialog';
import { Copy02Icon, Share08Icon } from 'hugeicons-react';
import { InputRoot } from './ui/input';
interface ChatShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionChatId: string;
  generateShareLink: (chatId: string) => Promise<void>;
  onCopyLink: () => void;
  shareLink: string;
  isGeneratingLink: boolean;
}
const ChatShareModal: React.FC<ChatShareModalProps> = ({ isOpen, onClose, sessionChatId, generateShareLink, onCopyLink, shareLink, isGeneratingLink }) => {
  const handleGenerateLink = async () => {
    try {
      await generateShareLink(sessionChatId);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Unable to generate share link',
        type: 'error',
      });
    }
  };
  const handleCopyShareLink = () => {
    onCopyLink();
    toaster.create({
      title: 'Copied',
      description: 'Share link copied to clipboard',
      type: 'success',
    });
  };
  return (
    <DialogRoot open={isOpen} onOpenChange={onClose} closeOnEscape closeOnInteractOutside placement="center" motionPreset="slide-in-bottom">
      <DialogBackdrop style={{ backdropFilter: 'blur(10px)' }} />
      <DialogContent bg="rgba(255, 255, 255, 0.8)" overflow="hidden">
        <DialogHeader display="flex" alignItems="center" p={2} fontSize="md" bg="gray.200">
          <DialogTitle display="flex" alignItems="center">
            <Share08Icon style={{ marginRight: 10 }} /> Share Chat
          </DialogTitle>
          <DialogCloseTrigger onClick={onClose} top={1} right={1} />
        </DialogHeader>
        <DialogBody p={3}>
          <VStack gap={4} width="full">
            {!shareLink ? (
              <Button onClick={handleGenerateLink} display="flex" my={1} minH="40px" disabled={!sessionChatId || isGeneratingLink} loading={isGeneratingLink} loadingText="Generating Link">
                Generate Share Link
              </Button>
            ) : (
              <HStack width="full">
                <InputGroup
                  w="100%"
                  borderRadius="8px"
                  overflow="hidden"
                  endOffset={'-16px'}
                  endElement={
                    <Button w={'calc(100% + 24px)'} borderRadius={0} size="sm" onClick={handleCopyShareLink} h="100%" px={0} minW="initial">
                      <Copy02Icon style={{ color: 'white', width: 20, height: 20 }} />
                    </Button>
                  }
                >
                  <InputRoot bg={'rgba(255, 255, 255, 0.5)'} borderColor="rgba(255,255,255,0.75)" value={shareLink} readOnly pl={3} />
                </InputGroup>
              </HStack>
            )}
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};
export default ChatShareModal;
