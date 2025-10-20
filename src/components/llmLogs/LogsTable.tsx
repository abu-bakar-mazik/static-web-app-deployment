'use client';
import React, { useCallback, useEffect, useRef } from 'react';
import { Box, Text, Table, Flex, Icon } from '@chakra-ui/react';
import { FilterIcon } from 'hugeicons-react';
import { Checkbox } from '@/components/ui/checkbox';
import { LogEntry } from '@/redux/types';
import { formatDisplayValue, getColumnWidth, getFieldKey } from '@/utils/logUtils';
interface LogsTableProps {
  logs: LogEntry[];
  tableHeaders: string[];
  selectedLogIds: Set<string>;
  isAllSelected: boolean;
  isLoading: boolean;
  isDeleting: boolean;
  borderColor: string;
  hasInitialized: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectLog: (logId: string, checked: boolean) => void;
}
export const LogsTable: React.FC<LogsTableProps> = ({ logs, tableHeaders, selectedLogIds, isAllSelected, isLoading, isDeleting, borderColor, hasInitialized, onSelectAll, onSelectLog }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [logs]);
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString();
  }, []);
  if (logs.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" h="300px" color="gray.500">
        <Icon w={12} h={12} mb={4}>
          <FilterIcon />
        </Icon>
        <Text fontSize="lg" fontWeight="medium" mb={2}>
          {isLoading ? 'Loading logs...' : 'No logs found'}
        </Text>
        {!isLoading && (
          <Text fontSize="sm" textAlign="center">
            {hasInitialized ? 'Try adjusting your filters or check back later' : 'Loading initial data...'}
          </Text>
        )}
      </Flex>
    );
  }
  return (
    <Table.ScrollArea borderWidth="1px" rounded="md" height="500px" ref={scrollAreaRef}>
      <Table.Root size="sm" stickyHeader>
        <Table.Header>
          <Table.Row borderBottom="1px solid" borderColor="rgba(255,255,255,0.5)" bg="rgb(200,209,229,0.8)" p={3} w="100%">
            <Table.ColumnHeader px={3} py={3} w="50px">
              <Checkbox checked={isAllSelected} onCheckedChange={(e) => onSelectAll(!!e.checked)} disabled={isLoading || isDeleting} />
            </Table.ColumnHeader>
            {tableHeaders.map((header: string, index: number) => {
              const fieldKey = getFieldKey(header);
              return (
                <Table.ColumnHeader key={index} px={3} py={3} maxW={getColumnWidth(fieldKey)} minW={getColumnWidth(fieldKey)}>
                  {header}
                </Table.ColumnHeader>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {logs.map((log: LogEntry, index: number) => {
            const logId = log.id || log.request_id;
            const isSelected = selectedLogIds.has(logId);
            return (
              <Table.Row key={`${log.id || log.request_id}-${index}`} bg="#eef1f7" borderBottom="1px solid" borderBottomColor={borderColor} borderTop="1px solid" borderTopColor="rgba(211,217,225,0.3)">
                <Table.Cell px={3} py={3}>
                  <Checkbox checked={isSelected} onCheckedChange={(e) => onSelectLog(logId, !!e.checked)} disabled={isLoading || isDeleting} />
                </Table.Cell>
                {tableHeaders.map((header: string, headerIndex: number) => {
                  const fieldKey = getFieldKey(header);
                  const value = (log as Record<string, any>)[fieldKey];
                  return (
                    <Table.Cell key={headerIndex} fontWeight={fieldKey === 'request_id' ? 'medium' : 'normal'} minW={getColumnWidth(fieldKey)}>
                      {formatDisplayValue(fieldKey, value, formatDate)}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
};
