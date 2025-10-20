import { useState } from 'react';
import { BatchResponse } from '@/types/batch-types';
import { toaster } from '@/components/ui/toaster';
interface BatchData {
  id: string;
  batch_response?: Record<string, BatchResponse[]>;
}
interface UseBatchExportReturn {
  isExporting: boolean;
  handleBatchExport: (batch: BatchData) => Promise<void>;
}
// Add helper function to escape CSV values
function escapeCSVValue(value: any): string {
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}
export const useBatchExport = (): UseBatchExportReturn => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const handleBatchExport = async (batch: BatchData) => {
    setIsExporting(true);
    try {
      const responses = Object.values(batch.batch_response || {}).flat() as BatchResponse[];
      const allFilenames = new Set<string>();
      const allQuestions = new Set<string>();
      const fileAnswers: Record<string, Record<string, string>> = {};
      responses.forEach((item: BatchResponse) => {
        allFilenames.add(item.filename);
        if (!fileAnswers[item.filename]) {
          fileAnswers[item.filename] = {};
        }
        if (item.response.question && item.response.answer) {
          allQuestions.add(item.response.question);
          fileAnswers[item.filename][item.response.question] = item.response.answer;
        }
      });
      const headers = ['Filename', ...Array.from(allQuestions)];
      const rows = Array.from(allFilenames).map((filename) => {
        const row = [filename];
        Array.from(allQuestions).forEach((question) => {
          row.push(fileAnswers[filename][question] || '');
        });
        return row;
      });
      const csvContent = [
        headers.map(escapeCSVValue).join(','),
        ...rows.map((row) =>
          row.map(escapeCSVValue).join(',')
        )
      ].join('\r\n');
      
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      const blob = new Blob([csvWithBOM], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch-${batch.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toaster.create({
        title: 'Batch Export Successful',
        type: 'success',
      });
    } catch (error) {
      console.log('Export failed:', error);
      toaster.create({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export batch',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };
  return {
    isExporting,
    handleBatchExport
  };
};