import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '@/utils/msalConfig';
import { ReactNode, useEffect, useState } from 'react';
const msalInstance = new PublicClientApplication(msalConfig);
interface MsalWrapperProps {
  children: ReactNode;
}
export const MsalWrapper = ({ children }: MsalWrapperProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
        setIsInitialized(true);
      }
    };
    initializeMsal();
  }, []);
  if (!isInitialized) {
    return null;
  }
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
