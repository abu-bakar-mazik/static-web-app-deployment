import React from 'react';
import { VStack, HStack, Box, Text } from '@chakra-ui/react';
import { LogsTokenSummary } from '@/redux/types';
interface SummaryStatsProps {
  tokenSummary: LogsTokenSummary[];
}
interface ModelStat {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}
export const SummaryStats: React.FC<SummaryStatsProps> = ({ tokenSummary }) => {
  const totalInputTokens = tokenSummary.reduce((sum: number, log: LogsTokenSummary) => sum + (log.total_input_tokens || 0), 0);
  const totalOutputTokens = tokenSummary.reduce((sum: number, log: LogsTokenSummary) => sum + (log.total_output_tokens || 0), 0);
  const totalTokens = tokenSummary.reduce((sum: number, log: LogsTokenSummary) => sum + (log.total_tokens || 0), 0);
  const getModelStatistics = (): ModelStat[] => {
    type ModelStats = { inputTokens: number; outputTokens: number; totalTokens: number };
    const modelStats = tokenSummary.reduce(
      (acc: Record<string, ModelStats>, tokenSummary: LogsTokenSummary) => {
        const modelName = tokenSummary.model_name || 'Unknown';
        if (!acc[modelName]) {
          acc[modelName] = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
        }
        acc[modelName].inputTokens += tokenSummary.total_input_tokens || 0;
        acc[modelName].outputTokens += tokenSummary.total_output_tokens || 0;
        acc[modelName].totalTokens += tokenSummary.total_tokens || 0;
        return acc;
      },
      {} as Record<string, ModelStats>,
    );
    return Object.entries(modelStats).map(([model, stats]) => ({
      modelName: model,
      inputTokens: stats.inputTokens,
      outputTokens: stats.outputTokens,
      totalTokens: stats.totalTokens,
    }));
  };
  if (tokenSummary.length === 0) return null;
  return (
    <VStack gap={4} align="stretch" marginTop={'1rem'}>
      <HStack gap={6} p={3} bg="white" borderRadius="md" border="1px solid" borderColor="#e1e5ec">
        <VStack gap={0} align="start">
          <Text fontSize="sm" color="gray.600">
            Total Models
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {tokenSummary.length.toLocaleString()}
          </Text>
        </VStack>
        <VStack gap={0} align="start">
          <Text fontSize="sm" color="gray.600">
            Input Tokens
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {totalInputTokens.toLocaleString()}
          </Text>
        </VStack>
        <VStack gap={0} align="start">
          <Text fontSize="sm" color="gray.600">
            Output Tokens
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {totalOutputTokens.toLocaleString()}
          </Text>
        </VStack>
        <VStack gap={0} align="start">
          <Text fontSize="sm" color="gray.600">
            Total Tokens
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {totalTokens.toLocaleString()}
          </Text>
        </VStack>
      </HStack>
      <Box p={3} bg="white" borderRadius="md" border="1px solid" borderColor="#e1e5ec">
        <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
          Token Usage by Model
        </Text>
        <VStack gap={2} align="stretch">
          {getModelStatistics().map((modelStat) => (
            <HStack key={modelStat.modelName} justify="space-between" p={2} bg="gray.50" borderRadius="sm">
              <VStack gap={0} align="start" flex={1}>
                <Text fontSize="sm" fontWeight="medium" color="gray.800">
                  {modelStat.modelName}
                </Text>
              </VStack>
              <HStack gap={4}>
                <VStack gap={0} align="end">
                  <Text fontSize="xs" color="gray.600">
                    Input
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {modelStat.inputTokens.toLocaleString()}
                  </Text>
                </VStack>
                <VStack gap={0} align="end">
                  <Text fontSize="xs" color="gray.600">
                    Output
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {modelStat.outputTokens.toLocaleString()}
                  </Text>
                </VStack>
                <VStack gap={0} align="end">
                  <Text fontSize="xs" color="gray.600">
                    Total
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="blue.600">
                    {modelStat.totalTokens.toLocaleString()}
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};
