import React, { useState } from 'react';
import { Box, Text, HStack, VStack, Badge, Icon } from '@chakra-ui/react';
import { FoldersIcon, ArrowDown01Icon, ArrowRight01Icon } from 'hugeicons-react';
interface Folder {
  path: string;
  name: string;
  fileCount: number;
  hasSubfolders: boolean;
  children?: Folder[];
  level?: number;
}
interface HierarchicalFolderBrowserProps {
  folders: Folder[];
  selectedPath: string;
  onSelectPath: (path: string) => void;
  isLoading?: boolean;
}
const FolderItem: React.FC<{
  folder: Folder;
  selectedPath: string;
  onSelectPath: (path: string) => void;
  level: number;
}> = ({ folder, selectedPath, onSelectPath, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedPath === folder.path;
  const hasChildren = folder.children && folder.children.length > 0;
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };
  const handleSelect = () => {
    onSelectPath(folder.path);
  };
  return (
    <Box w="100%">
      <HStack
        gap={2}
        p={2}
        pl={`${level * 20 + 8}px`}
        bg={isSelected ? 'blue.50' : 'white'}
        borderRadius="8px"
        border="1px solid"
        borderColor={isSelected ? 'blue.500' : 'gray.200'}
        cursor="pointer"
        onClick={handleSelect}
        _hover={{
          borderColor: isSelected ? 'blue.600' : 'blue.300',
          bg: isSelected ? 'blue.50' : 'gray.50',
        }}
        transition="all 0.2s ease"
        mb={1}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <Box onClick={handleToggle} cursor="pointer" display="flex" alignItems="center" p={1} _hover={{ bg: 'gray.100' }} borderRadius="4px">
            {isExpanded ? <ArrowDown01Icon size={16} color="#6b7280" /> : <ArrowRight01Icon size={16} color="#6b7280" />}
          </Box>
        )}
        {/* Folder Icon */}
        <Box p={1.5} bg={isSelected ? 'blue.500' : 'gray.100'} borderRadius="6px" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
          <FoldersIcon size={16} color={isSelected ? 'white' : '#6b7280'} />
        </Box>
        {/* Folder Name */}
        <Text fontSize="sm" fontWeight="medium" color={isSelected ? 'blue.700' : 'gray.900'} flex="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {folder.name}
        </Text>
        {/* File Count Badge */}
        <Badge colorPalette={isSelected ? 'blue' : 'gray'} size="sm" px={2.5} h={'auto'} borderRadius="full" flexShrink={0} fontSize={'xs'}>
          {folder.fileCount}
        </Badge>
        {/* Selection Indicator */}
        {isSelected && <Box w={2} h={2} bg="blue.500" borderRadius="full" flexShrink={0} />}
      </HStack>
      {/* Render Children */}
      {isExpanded && hasChildren && (
        <VStack gap={0} align="stretch" mt={1} ml={4}>
          {folder.children!.map((child) => (
            <FolderItem key={child.path} folder={child} selectedPath={selectedPath} onSelectPath={onSelectPath} level={level + 1} />
          ))}
        </VStack>
      )}
    </Box>
  );
};
const HierarchicalFolderBrowser: React.FC<HierarchicalFolderBrowserProps> = ({ folders, selectedPath, onSelectPath, isLoading }) => {
  const buildHierarchy = (flatFolders: Folder[]): Folder[] => {
    const folderMap = new Map<string, Folder>();
    const rootFolders: Folder[] = [];
    flatFolders.forEach((folder) => {
      folderMap.set(folder.path, { ...folder, children: [] });
    });
    flatFolders.forEach((folder) => {
      const currentFolder = folderMap.get(folder.path)!;
      if (folder.path === '' || !folder.path.includes('/')) {
        rootFolders.push(currentFolder);
      } else {
        const pathParts = folder.path.split('/');
        const parentPath = pathParts.slice(0, -1).join('/');
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(currentFolder);
        } else {
          rootFolders.push(currentFolder);
        }
      }
    });
    return rootFolders;
  };
  const hierarchicalFolders = buildHierarchy(folders);
  if (isLoading) {
    return (
      <Box p={12} textAlign="center">
        <Text fontSize="sm" color="gray.600">
          Loading folders...
        </Text>
      </Box>
    );
  }
  if (hierarchicalFolders.length === 0) {
    return (
      <Box p={12} textAlign="center">
        <Text fontSize="md" color="gray.700" fontWeight="semibold" mb={2}>
          No folders found
        </Text>
        <Text fontSize="sm" color="gray.500">
          Upload files to the file share to get started
        </Text>
      </Box>
    );
  }
  return (
    <VStack gap={0} align="stretch" p={2}>
      {hierarchicalFolders.map((folder) => (
        <FolderItem key={folder.path} folder={folder} selectedPath={selectedPath} onSelectPath={onSelectPath} level={0} />
      ))}
    </VStack>
  );
};
export default HierarchicalFolderBrowser;
