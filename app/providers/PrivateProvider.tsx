'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useMsalAuthHelper from '@/hooks/useMsalAuth';
import { useDispatch } from 'react-redux';
import { initializeState } from '@/redux/slices/SelectedDocsSlice';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
export function PrivateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { inProgress, isAuthenticated, isInitialized } = useMsalAuthHelper();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedDocs = sessionStorage.getItem('selectedDocs');
        const parsedDocs = storedDocs ? JSON.parse(storedDocs) : [];
        if (Array.isArray(parsedDocs)) {
          dispatch(initializeState(parsedDocs));
        }
      } catch (error) {
        console.log('Error reading from sessionStorage:', error);
        dispatch(initializeState([]));
      }
    }
  }, [dispatch]);
  useEffect(() => {
    if (isInitialized && inProgress === 'none' && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, inProgress, isAuthenticated, router]);
  if (!isInitialized || inProgress !== 'none' || !isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
