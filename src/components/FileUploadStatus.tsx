// import React, { useEffect, useMemo, useState } from 'react';
// import { Box, Text, List, ListItem, Badge, HStack, Progress, VStack } from '@chakra-ui/react';
// import { Document } from '@/types/doc-types';

// interface FileUploadStatusProps {
//   files: Document[];
//   queueStatus?: {
//     current_queue: Array<{
//       status: 'pending' | 'processing' | 'Success';
//       metadata: {
//         name: string;
//         file_id: string;
//       };
//     }>;
//   };
//   uploadingFiles: Document[];
// }

// const generateUniqueKey = (prefix: string, identifier: string, timestamp?: number) => {
//   const time = timestamp || Date.now();
//   const random = Math.random().toString(36).substring(2, 8);
//   return `${prefix}-${identifier}-${time}-${random}`;
// };

// const FileUploadStatus: React.FC<FileUploadStatusProps> = ({ files, queueStatus, uploadingFiles }) => {
//   const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
//   const getStatusColor = (status: Document['status']) => {
//     switch (status) {
//       case 'Success':
//         return 'green';
//       case 'processing':
//         return 'yellow';
//       case 'pending':
//         return 'blue';
//       default:
//         return 'gray';
//     }
//   };

//   const getStatusText = (status: Document['status']) => {
//     switch (status) {
//       case 'Success':
//         return 'Complete';
//       case 'processing':
//         return 'Processing';
//       case 'pending':
//         return 'Pending';
//       default:
//         return 'Waiting';
//     }
//   };

//   // Show all files that are either pending, processing, or being uploaded
//   const { activeFiles, completedFiles } = useMemo(() => {
//     const active = files.filter((file) => file.status !== 'Success' || file.uploading);

//     const completed = files.filter((file) => file.status === 'Success' && !file.uploading);

//     return { activeFiles: active, completedFiles: completed };
//   }, [files]);

//   useEffect(() => {
//     // Handle newly completed files
//     const newCompletedFiles = completedFiles.filter((file) => !recentlyCompleted.has(file.id || file.name)).map((file) => file.id || file.name);

//     if (newCompletedFiles.length > 0) {
//       setRecentlyCompleted((prev) => {
//         const updated = new Set(prev);
//         newCompletedFiles.forEach((fileId) => updated.add(fileId));
//         return updated;
//       });

//       // Remove completed files from visibility after delay
//       const timeoutId = setTimeout(() => {
//         setRecentlyCompleted((prev) => {
//           const updated = new Set(prev);
//           newCompletedFiles.forEach((fileId) => updated.delete(fileId));
//           return updated;
//         });
//       }, 3000);

//       return () => clearTimeout(timeoutId);
//     }
//   }, [completedFiles]);

//   const displayFiles = useMemo(() => {
//     const recentlyCompletedFiles = completedFiles.filter((file) => recentlyCompleted.has(file.id || file.name));
//     return [...activeFiles, ...recentlyCompletedFiles];
//   }, [activeFiles, completedFiles, recentlyCompleted]);

//   // If no files to display, return null
//   if (!displayFiles.length) {
//     return null;
//   }

//   return (
//     <Box maxH={{ base: '122px', lg: 'auto' }} overflowY={{ base: 'auto', lg: 'visible' }}>
//       <VStack mb={3} justify="space-between" alignItems="flex-start">
//         <Text display={{ base: 'none', lg: 'block' }} fontSize="sm" color="gray.600" fontWeight="600" mb="0">
//           Processing Files
//         </Text>
//         <Text fontSize="xs" color="gray.600" ml="auto">
//           {activeFiles.length} file{activeFiles.length !== 1 ? 's' : ''} in progress
//         </Text>
//       </VStack>

//       <List spacing={3}>
//         {displayFiles.map((file) => {
//           const queueItem = queueStatus?.current_queue?.find((item) => {
//             if (!item?.metadata) return false;
//             return item.metadata.file_id === file.file_id || item.metadata.name === file.name;
//           });
//           const currentStatus = queueItem?.status || file.status || 'pending';
//           const itemKey = file.file_id || generateUniqueKey('file', file.name);

//           return (
//             <ListItem
//               key={itemKey}
//               py={2}
//               px={3}
//               bg="white"
//               borderRadius="md"
//               border="1px solid"
//               borderColor="gray.200"
//               style={{
//                 transition: 'opacity 0.5s ease-out',
//                 opacity: currentStatus === 'Success' ? 0.7 : 1,
//               }}
//             >
//               <HStack justify="space-between">
//                 <Text fontSize="xs" fontWeight="medium" isTruncated maxW="70%">
//                   {file.name}
//                 </Text>
//                 <Badge colorScheme={getStatusColor(currentStatus)} fontSize="10px" px={2}>
//                   {getStatusText(currentStatus)}
//                 </Badge>
//               </HStack>
//               <HStack>
//                 <Progress value={file.progress} size="xs" colorScheme="blue" w="100%" />
//                 {/* <Text fontSize="xs" color="gray.500">
//                   {Math.round(file.progress)}%
//                 </Text> */}
//               </HStack>
//             </ListItem>
//           );
//         })}
//       </List>
//     </Box>
//   );
// };

// export default FileUploadStatus;
