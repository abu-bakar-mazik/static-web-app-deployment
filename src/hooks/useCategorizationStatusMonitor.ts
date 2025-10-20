import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

interface CategorizationStatusMonitorProps {
  onCategorizationComplete?: () => void;
  pollingInterval?: number;
  enabled?: boolean;
}

/**
 * Hook to monitor categorization processing status and trigger callbacks when completed
 */
export const useCategorizationStatusMonitor = ({
  onCategorizationComplete,
  pollingInterval = 5000, // 5 seconds
  enabled = true
}: CategorizationStatusMonitorProps) => {
  const { userId } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessingCountRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !userId || !onCategorizationComplete) {
      return;
    }

    const checkCategorizationStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/doc-category/categorization-queue-status`, {
          method: 'GET',
          headers: {
            'user-id': userId,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const currentProcessingCount = data.processing_count || 0;
          
          // If processing count decreased from previous check, categorization completed
          if (lastProcessingCountRef.current > 0 && currentProcessingCount < lastProcessingCountRef.current) {
            console.log('Categorization processing completed, triggering refresh');
            onCategorizationComplete();
          }
          
          lastProcessingCountRef.current = currentProcessingCount;
        }
      } catch (error) {
        console.error('Error checking categorization status:', error);
      }
    };

    // Start polling
    intervalRef.current = setInterval(checkCategorizationStatus, pollingInterval);

    // Initial check
    checkCategorizationStatus();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, userId, onCategorizationComplete, pollingInterval]);

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return { stopMonitoring };
};
