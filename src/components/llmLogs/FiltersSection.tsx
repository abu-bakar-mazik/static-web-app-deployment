import React from 'react';
import { Box, VStack, HStack, Text, Spinner, ListCollection } from '@chakra-ui/react';
import { FilterIcon, FilterRemoveIcon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { FieldRoot } from '@/components/ui/field';
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from '@/components/ui/select';
import { InputRoot } from '@/components/ui/input';
import { ApiUser } from '@/redux/types';
interface ApiUserOptions extends ApiUser {
  label: string;
  value: string;
}
interface FiltersSectionProps {
  userOptions: ListCollection<ApiUserOptions>;
  modelOptions: ListCollection<{ label: string; value: string }>;
  requestTypeOptions: ListCollection<{ label: string; value: string }>;
  allSelectedUsers: string[];
  selectedModelName: string[];
  selectedRequestType: string[];
  startDate: string;
  endDate: string;
  isLoading: boolean;
  isLoadingUsers: boolean;
  onUserSelect: (details: { value: string[] }) => void;
  onModelSelect: (details: { value: string[] }) => void;
  onRequestTypeSelect: (details: { value: string[] }) => void;
  onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}
export const FiltersSection: React.FC<FiltersSectionProps> = ({ userOptions, modelOptions, requestTypeOptions, allSelectedUsers, selectedModelName, selectedRequestType, startDate, endDate, isLoading, isLoadingUsers, onUserSelect, onModelSelect, onRequestTypeSelect, onStartDateChange, onEndDateChange, onApplyFilters, onClearFilters }) => {
  const hasActiveFilters = allSelectedUsers.length > 0 || startDate || endDate || selectedModelName || selectedRequestType;
  return (
    <Box p={4} bg="#f8f9fa" borderBottom="1px solid" borderBottomColor="#e1e5ec">
      <VStack gap={4} align="stretch">
        <HStack gap={4} align="end">
          {/* User Selection */}
          <FieldRoot label="Select Users" minW="200px">
            <SelectRoot collection={userOptions} value={allSelectedUsers} onValueChange={onUserSelect} disabled={isLoadingUsers} positioning={{ sameWidth: false }} multiple>
              <SelectTrigger>
                <SelectValueText placeholder="All users..." />
              </SelectTrigger>
              <SelectContent portalled={false}>
                {userOptions.items.map((item) => (
                  <SelectItem key={item.value} item={item.value}>
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="medium">
                        {item.label}
                      </Text>
                      <HStack gap={2}>
                        {item.email && (
                          <Text fontSize="xs" color="gray.500">
                            {item.email}
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </FieldRoot>
          {/* Model Selection */}
          <FieldRoot label="Model" minW="150px">
            <SelectRoot collection={modelOptions} value={selectedModelName} onValueChange={onModelSelect} multiple>
              <SelectTrigger>
                <SelectValueText placeholder="All models..." />
              </SelectTrigger>
              <SelectContent portalled={false}>
                {modelOptions.items.map((item) => (
                  <SelectItem key={item.value} item={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </FieldRoot>
          {/* Request Type Selection */}
          <FieldRoot label="Request Type" minW="150px">
            <SelectRoot collection={requestTypeOptions} value={selectedRequestType} onValueChange={onRequestTypeSelect} multiple>
              <SelectTrigger>
                <SelectValueText placeholder="All types..." />
              </SelectTrigger>
              <SelectContent portalled={false}>
                {requestTypeOptions.items.map((item) => (
                  <SelectItem key={item.value} item={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </FieldRoot>
          {/* Date Range */}
          <FieldRoot label="Start Date">
            <InputRoot type="date" value={startDate} onChange={onStartDateChange} placeholder="Select start date" />
          </FieldRoot>
          <FieldRoot label="End Date">
            <InputRoot type="date" value={endDate} onChange={onEndDateChange} placeholder="Select end date" />
          </FieldRoot>
          {/* Action Buttons */}
          <Button visual="primary" onClick={onApplyFilters} disabled={isLoading} minH="50px">
            {isLoading ? <Spinner size="sm" mr={2} /> : <FilterIcon />}
            Apply Filters
          </Button>
          <Button visual="outline" onClick={onClearFilters} disabled={isLoading} minH="50px">
            <FilterRemoveIcon />
          </Button>
        </HStack>
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
            <Text fontSize="sm" color="blue.700" fontWeight="medium">
              Active Filters:
            </Text>
            <HStack gap={2} mt={1} flexWrap="wrap">
              {allSelectedUsers.length > 0 && (
                <Text fontSize="xs" bg="blue.100" px={2} py={1} borderRadius="md" color="blue.800">
                  Users: {allSelectedUsers.length} selected
                </Text>
              )}
              {selectedModelName.length > 0 && (
                <Text fontSize="xs" bg="blue.100" px={2} py={1} borderRadius="md" color="blue.800">
                  Models: {selectedModelName.length} selected
                </Text>
              )}
              {selectedRequestType.length > 0 && (
                <Text fontSize="xs" bg="blue.100" px={2} py={1} borderRadius="md" color="blue.800">
                  Types: {selectedRequestType.length} selected
                </Text>
              )}
              {startDate && (
                <Text fontSize="xs" bg="blue.100" px={2} py={1} borderRadius="md" color="blue.800">
                  From: {startDate}
                </Text>
              )}
              {endDate && (
                <Text fontSize="xs" bg="blue.100" px={2} py={1} borderRadius="md" color="blue.800">
                  To: {endDate}
                </Text>
              )}
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
