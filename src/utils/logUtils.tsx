import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { LogEntry } from '@/redux/types';
export const REQUEST_TYPES = {
  CHAT: 'chat',
  BATCH: 'batch',
  FILEPROCESSING: 'fileprocessing',
  AUTOMATION_CATEGORIZATION: 'automation-categorization',
  AUTOMATION_FULLANALYSIS: "automation-fullanalysis",
  AUTOMATION_CATEGORIZATION_FULLANALYSIS: "automation-categorization-fullanalysis",
  SESSION_TITLE: 'session-title',
  CATEGORIZATION: 'categorization',
} as const;
export const MODEL_TYPES = {
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  TEXT_EMBEDDING_ADA_002: 'text-embedding-ada-002',
} as const;
type FieldKey = 'display_name' | 'request_type' | 'input_tokens' | 'output_tokens' | 'total_tokens' | 'model_name' | 'created_at';
export const REQUEST_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; textColor: string }> = {
  [REQUEST_TYPES.CHAT]: {
    label: 'Chat',
    color: 'blue',
    bgColor: 'blue.50',
    textColor: 'blue.700',
  },
  [REQUEST_TYPES.BATCH]: {
    label: 'Batch',
    color: 'green',
    bgColor: 'green.50',
    textColor: 'green.700',
  },
  [REQUEST_TYPES.FILEPROCESSING]: {
    label: 'File Processing',
    color: 'purple',
    bgColor: 'purple.50',
    textColor: 'purple.700',
  },
  [REQUEST_TYPES.AUTOMATION_CATEGORIZATION]: {
    label: 'Automation Categorization',
    color: 'pink',
    bgColor: 'pink.50',
    textColor: 'pink.700',
  },
  [REQUEST_TYPES.AUTOMATION_FULLANALYSIS]: {
    label: 'Automation Full Analysis',
    color: 'orange',
    bgColor: 'orange.50',
    textColor: 'orange.700',
  },
  [REQUEST_TYPES.AUTOMATION_CATEGORIZATION_FULLANALYSIS]: {
    label: 'Automation Categorization & Full Analysis',
    color: 'pink',
    bgColor: 'pink.50',
    textColor: 'pink.700',
  },
  [REQUEST_TYPES.SESSION_TITLE]: {
    label: 'Session Title',
    color: 'cyan',
    bgColor: 'cyan.50',
    textColor: 'cyan.700',
  },
  [REQUEST_TYPES.CATEGORIZATION]: {
    label: 'Categorization',
    color: 'pink',
    bgColor: 'pink.50',
    textColor: 'pink.700',
  },
};
export const MODEL_CONFIG: Record<
  string,
  {
    label: string;
    category: 'OpenAI' | 'Anthropic' | 'Embedding';
    bgColor: string;
    textColor: string;
  }
> = {
  [MODEL_TYPES.GPT_4O]: {
    label: 'GPT-4o',
    category: 'OpenAI',
    bgColor: 'green.50',
    textColor: 'green.700',
  },
  [MODEL_TYPES.GPT_4O_MINI]: {
    label: 'GPT-4o Mini',
    category: 'OpenAI',
    bgColor: 'green.50',
    textColor: 'green.700',
  },
  [MODEL_TYPES.TEXT_EMBEDDING_ADA_002]: {
    label: 'Text Embedding Ada 002',
    category: 'Embedding',
    bgColor: 'orange.50',
    textColor: 'orange.700',
  },
};
export const getAllModels = (): string[] => {
  return Object.values(MODEL_TYPES);
};
export const getModelDisplayName = (modelValue: string): string => {
  return MODEL_CONFIG[modelValue]?.label || modelValue;
};
export const getModelCategory = (modelValue: string): string => {
  return MODEL_CONFIG[modelValue]?.category || 'Unknown';
};
export const getModelOptions = (availableModels?: string[]) => {
  const modelsToUse = availableModels || getAllModels();
  return modelsToUse
    .map((model) => ({
      label: getModelDisplayName(model),
      value: model,
      category: getModelCategory(model),
    }))
    .sort((a, b) => {
      if (b.category !== a.category) {
        return b.category.localeCompare(a.category);
      }
      return b.label.localeCompare(a.label);
    });
};
export const getFieldKey = (displayHeader: string): string => {
  const headerToFieldMap: Record<string, FieldKey> = {
    'Display Name': 'display_name',
    'Request Type': 'request_type',
    'Input Tokens': 'input_tokens',
    'Output Tokens': 'output_tokens',
    'Total Tokens': 'total_tokens',
    'Model Name': 'model_name',
    'Created At': 'created_at',
  };
  return headerToFieldMap[displayHeader] || displayHeader.toLowerCase().replace(/\s+/g, '_');
};
export const getColumnWidth = (fieldKey: string): string => {
  const widthMap: Record<string, string> = {
    display_name: '150px',
    request_type: '120px',
    input_tokens: '100px',
    output_tokens: '100px',
    total_tokens: '100px',
    model_name: '100px',
    created_at: '140px',
  };
  return widthMap[fieldKey] || 'auto';
};
export const formatDisplayValue = (fieldKey: string, value: any, formatDate?: (date: string) => string) => {
  if (fieldKey === 'request_type') {
    const config = REQUEST_TYPE_CONFIG[value] || {
      label: value || 'Unknown',
      bgColor: 'gray.50',
      textColor: 'gray.700',
    };
    return (
      <Box px={2} py={1} borderRadius="md" bg={config.bgColor} color={config.textColor} fontSize="sm" display="inline-block" fontWeight="medium">
        {config.label}
      </Box>
    );
  }
  if (fieldKey === 'model_name') {
    return (
      <Text fontSize="sm" fontFamily="mono" bg="gray.100" px={2} py={1} borderRadius="sm" display="inline-block">
        {value || 'Unknown'}
      </Text>
    );
  }
  if (fieldKey === 'created_at') {
    return (
      <Text fontSize="sm" color="gray.600">
        {value && formatDate ? formatDate(value) : 'N/A'}
      </Text>
    );
  }
  if (['input_tokens', 'output_tokens', 'total_tokens'].includes(fieldKey)) {
    return (
      <Text textAlign="right" maxW={'100px'} fontWeight={fieldKey === 'total_tokens' ? 'medium' : 'normal'}>
        {typeof value === 'number' ? value.toLocaleString() : value || '0'}
      </Text>
    );
  }
  if (fieldKey === 'display_name') {
    return (
      <Text fontSize="sm" fontWeight="medium" color="gray.800">
        {value || 'N/A'}
      </Text>
    );
  }
  return typeof value === 'object' ? JSON.stringify(value) : value || 'N/A';
};
export const generateTableHeaders = (records: LogEntry[]): string[] => {
  if (records.length === 0) return [];
  const desiredColumns: FieldKey[] = ['display_name', 'request_type', 'input_tokens', 'output_tokens', 'total_tokens', 'model_name', 'created_at'];
  const customLabels: Record<FieldKey, string> = {
    display_name: 'Display Name',
    request_type: 'Request Type',
    input_tokens: 'Input Tokens',
    output_tokens: 'Output Tokens',
    total_tokens: 'Total Tokens',
    model_name: 'Model Name',
    created_at: 'Created At',
  };
  return desiredColumns.map((fieldKey) => customLabels[fieldKey]);
};
export const formatDateForAPI = (dateString: string, isEndDate: boolean = false): string => {
  const date = new Date(dateString);
  if (isEndDate) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
};
