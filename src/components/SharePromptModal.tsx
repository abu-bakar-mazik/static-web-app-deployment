'use client';
import React, { useMemo } from 'react';
import { Box, VStack, HStack, Text, Spinner } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { DialogActionTrigger, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from '@/components/ui/dialog';
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from '@/components/ui/select';
import { FieldRoot } from '@/components/ui/field';
import { Share08Icon } from 'hugeicons-react';
import { createListCollection } from '@chakra-ui/react';
import { ApiUser } from '@/redux/types';
interface SharePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: ApiUser[];
  isLoadingUsers: boolean;
  selectedUsers: string[];
  onToggleUser: (userId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onShare: () => void;
  isSharing?: boolean;
}
export const SharePromptModal: React.FC<SharePromptModalProps> = ({ isOpen, onClose, users, isLoadingUsers, selectedUsers, onToggleUser, onSelectAll, onClearSelection, onShare, isSharing = false }) => {
  const userOptions = useMemo(() => {
    return createListCollection({
      items: users.map((user: ApiUser) => ({
        user_id: user.userid,
        email: user.email,
        username: user.username,
        label: user.username || user.email || user.userid,
        value: user.userid,
      })),
    });
  }, [users]);
  const handleUserSelect = (details: { value: string[] }) => {
    const newUsers = details.value.filter((userId) => !selectedUsers.includes(userId));
    const removedUsers = selectedUsers.filter((userId) => !details.value.includes(userId));
    newUsers.forEach((userId) => onToggleUser(userId));
    removedUsers.forEach((userId) => onToggleUser(userId));
  };
  const handleShare = () => {
    onShare();
  };
  const handleClose = () => {
    onClose();
  };
  return (
    <DialogRoot open={isOpen} onOpenChange={({ open }) => !open && handleClose()}>
      <DialogContent maxW="md">
        <DialogHeader>
          <DialogTitle>
            <HStack>
              <Share08Icon size={20} />
              <Text>Share Prompt</Text>
            </HStack>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} align="stretch">
            {/* Multi-select dropdown */}
            <FieldRoot label="Select Users to Share With">
              {/* <FieldLabel>Select Users to Share With</FieldLabel> */}
              <SelectRoot multiple collection={userOptions} value={selectedUsers} onValueChange={handleUserSelect} disabled={isLoadingUsers} positioning={{ sameWidth: true }}>
                <SelectTrigger>
                  <SelectValueText placeholder="Select users to share with..." />
                </SelectTrigger>
                <SelectContent portalled={false}>
                  {userOptions.items.map((item) => (
                    <SelectItem key={item.value} item={item.value}>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {item.label}
                        </Text>
                        {item.email && (
                          <Text fontSize="xs" color="gray.500">
                            {item.email}
                          </Text>
                        )}
                      </VStack>
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </FieldRoot>
            {/* Loading state */}
            {isLoadingUsers && (
              <HStack justify="center" py={2}>
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.500">
                  Loading users...
                </Text>
              </HStack>
            )}
            {/* Quick action buttons */}
            <HStack justify="space-between">
              <Button size="sm" visual="outline" onClick={onSelectAll} disabled={isLoadingUsers || users.length === 0}>
                Select All ({users.length})
              </Button>
              <Button size="sm" visual="outline" onClick={onClearSelection} disabled={selectedUsers.length === 0}>
                Clear Selection
              </Button>
            </HStack>
            {/* Selected count display */}
            {selectedUsers.length > 0 && (
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.700" fontWeight="medium">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </Text>
                <Text fontSize="xs" color="blue.600" mt={1}>
                  {selectedUsers
                    .map((userId) => {
                      const user = users.find((u) => u.userid === userId);
                      return user?.username || userId;
                    })
                    .join(', ')}
                </Text>
              </Box>
            )}
            {/* No users message */}
            {!isLoadingUsers && users.length === 0 && (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                No users available to share with.
              </Text>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button visual="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button onClick={handleShare} disabled={selectedUsers.length === 0 || isSharing} colorPalette="blue">
            {isSharing ? (
              <>
                <Spinner size="sm" style={{ marginRight: 8 }} />
                Sharing...
              </>
            ) : (
              <>
                <Share08Icon size={16} style={{ marginRight: 8 }} />
                Share with {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
