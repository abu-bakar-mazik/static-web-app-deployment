import { useCallback, useEffect } from "react";
export const useSessionCleanup = () => {
  // For manual navigation/logout
  const navigateWithCleanup = useCallback((url: string) => {
    // Only remove userId cookie
    document.cookie = 'userId=; path=/';
    window.location.href = url;
  }, []);

  useEffect(() => {
    let isUnloading = false;
    
    const handleUnload = () => {
      isUnloading = true;
      // Reset after a brief timeout to handle refresh cases
      setTimeout(() => {
        isUnloading = false;
      }, 100);
    };

    const handleVisibilityChange = () => {
      // Only clear if tab is hidden and it's not a refresh
      if (document.visibilityState === 'hidden' && !isUnloading) {
        document.cookie = 'userId=; path=/';
      }
    };

    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return navigateWithCleanup;
};