import React from 'react';
import { VStack, HStack, Text, Progress, Icon, Badge, Box } from '@chakra-ui/react';
import { FiLoader, FiCheckCircle, FiFile, FiSearch } from 'react-icons/fi';
import { useColorModeValue } from './ui/color-mode';
interface BatchProcessingStatusProps {
  status: string;
  progress: number;
}
const ProcessingStep: React.FC<{
  isActive: boolean;
  isCompleted: boolean;
  icon: React.ElementType;
  label: string;
  detail?: string;
}> = ({ isActive, isCompleted, icon, label, detail }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  return (
    <HStack gap={3} w="100%" p={3} bg={isActive ? 'blue.50' : bgColor} border="1px solid" borderColor={isActive ? 'blue.200' : borderColor} borderRadius="md" transition="all 0.2s">
      <Icon as={icon} color={isCompleted ? 'green.500' : isActive ? 'blue.500' : 'gray.400'} className={isActive ? 'spinning' : ''} w={5} h={5} />
      <Box flex={1}>
        <Text fontSize="sm" fontWeight="medium" color={isActive ? 'blue.700' : 'gray.700'}>
          {label}
        </Text>
        {detail && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            {detail}
          </Text>
        )}
      </Box>
      {isCompleted && <Icon as={FiCheckCircle} color="green.500" />}
    </HStack>
  );
};
const BatchProcessingStatus: React.FC<BatchProcessingStatusProps> = ({ status, progress }) => {
  const getStepStatus = (threshold: number) => ({
    isActive: progress >= threshold && progress < threshold + 25,
    isCompleted: progress >= threshold + 25,
  });
  const documentStep = getStepStatus(0);
  const retrievalStep = getStepStatus(25);
  const analysisStep = getStepStatus(50);
  const completionStep = getStepStatus(75);
  return (
    <Box w="100%">
      <VStack gap={4} align="stretch" w="100%">
        <HStack gap={3} mt={2}>
          <Badge colorPalette={status === 'completed' ? 'green' : 'orange'} variant="subtle" px={2} py={1} borderRadius="full">
            {status.toUpperCase()}
          </Badge>
          <Progress.Root w="100%" shape={'full'} value={progress} size="xs" colorPalette="blue" flex={1} striped={progress < 100} animated={progress < 100}>
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="sm" color="gray.500" minW="45px" textAlign="right">
            {Math.round(progress)}%
          </Text>
        </HStack>
        <HStack gap={3} align="stretch">
          <ProcessingStep isActive={documentStep.isActive} isCompleted={documentStep.isCompleted} icon={FiFile} label="Document Processing" detail="Preparing documents for analysis" />
          <ProcessingStep isActive={retrievalStep.isActive} isCompleted={retrievalStep.isCompleted} icon={FiSearch} label="Information Retrieval" detail="Extracting relevant information" />
          <ProcessingStep isActive={analysisStep.isActive} isCompleted={analysisStep.isCompleted} icon={FiLoader} label="Analysis" detail="Processing and analyzing content" />
          <ProcessingStep isActive={completionStep.isActive} isCompleted={completionStep.isCompleted} icon={FiCheckCircle} label="Completion" detail="Finalizing results" />
        </HStack>
      </VStack>
      <style jsx global>{`
        .spinning {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
};
export default BatchProcessingStatus;
