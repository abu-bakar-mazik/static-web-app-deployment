'use client';
import React, { useState } from 'react';
import { Box, HStack, Text, Spinner } from '@chakra-ui/react';
import { ArrowLeft01Icon, ArrowRight01Icon, Delete02Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '../confirmationDialog';
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  availableRecords: number;
  limit: number;
  selectedLogIds?: Set<string>;
  isLoading: boolean;
  isDeleting?: boolean;
  onPageChange: (page: number) => void;
  onDeleteSelected?: () => void;
}
export const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, availableRecords, totalRecords, limit, selectedLogIds, isLoading, isDeleting, onPageChange, onDeleteSelected }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const hasSelectedItems = selectedLogIds && selectedLogIds.size > 0;
  return (
    <Box p={4} borderBottom="1px solid" borderBottomColor="#d6dbe5">
      <HStack justify="space-between" align="center">
        <Text fontSize="xs" color="gray.600">
          Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, availableRecords)} of {availableRecords.toLocaleString()} entries
        </Text>
        <HStack gap={2}>
          {hasSelectedItems && (
            <>
              <Button onClick={() => setIsDeleteOpen(true)} disabled={isDeleting} visual="outlineRed">
                {isDeleting ? <Spinner size="sm" mr={2} /> : <Delete02Icon />}
                Delete ({selectedLogIds.size})
              </Button>
              <ConfirmationDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={onDeleteSelected} title="Delete Item" description="Are you sure you want to delete? This action cannot be undone." confirmText="Confirm" variant="destructive" />
            </>
          )}
          <Button visual="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={!hasPrevPage || isLoading} w={'40px'}>
            <ArrowLeft01Icon size={16} />
          </Button>
          <HStack gap={1}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button key={pageNum} visual={currentPage === pageNum ? 'primary' : 'outline'} size="sm" onClick={() => onPageChange(pageNum)} disabled={isLoading} minW="40px">
                  {pageNum}
                </Button>
              );
            })}
          </HStack>
          <Button visual="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={!hasNextPage || isLoading} w={'40px'}>
            <ArrowRight01Icon size={16} />
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};
