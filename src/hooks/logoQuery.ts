import { useGetLogoQuery } from '@/redux/slices/adminSlice';
import { useMemo } from 'react';

export const useLogo = () => {
  const { data, error, isLoading: isLogoFetching, refetch } = useGetLogoQuery();
  const logoWithCache = useMemo(() => {
    if (!data?.url) return null;
    return `${data.url}&cache=${Date.now()}`;
  }, [data?.url]);
  return {
    logoUrl: data?.url || null,
    logoWithCache,
    isLogoFetching,
    error: error as Error | null,
    refetchLogo: refetch
  };
};
