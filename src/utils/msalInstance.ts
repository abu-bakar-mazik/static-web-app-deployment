import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@/utils/msalConfig';

export const msalInstance = new PublicClientApplication(msalConfig);