import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import {
  setUserAuthenticated,
  clearAuth,
  useAuthenticateUserMutation,
  setAuthError,
  setAuthSession,
  type UserProfile
} from '@/redux/slices/authSlice';
import { setIdTokenClaims, setUserAccount } from '@/redux/slices/sessionSlice';
import { RootState } from '@/redux/store';
import { IdTokenClaims } from '@/types/types';
import { msalConfig } from '@/utils/msalConfig';
import { AuthenticationResult } from '@azure/msal-browser';
import { toaster } from '@/components/ui/toaster';
const useMsalAuthHelper = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [authenticateUserMutation, { isLoading: isAuthenticating }] = useAuthenticateUserMutation();
  const authState = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        if (inProgress === 'none' && !isInitialized) {
          setIsInitialized(true);
          if (accounts.length > 0) {
            const account = accounts[0];
            dispatch(setIdTokenClaims(account.idTokenClaims as IdTokenClaims));
            dispatch(setUserAccount(account));
            dispatch(setUserAuthenticated(true));
            if (account.localAccountId) {
              document.cookie = `userId=${account.localAccountId}; path=/; secure; samesite=strict`;
            }
          }
        }
      } catch (error) {
        console.error('MSAL initialization error:', error);
        setIsInitialized(true);
      }
    };
    initializeMsal();
  }, [inProgress, accounts, dispatch, isInitialized]);
  const handleLogin = useCallback(() => {
    if (!isInitialized) {
      console.warn('MSAL not initialized yet');
      return;
    }
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      sessionStorage.setItem('returnUrl', returnUrl);
    }
    instance.loginRedirect({
      scopes: ['openid', 'profile', 'email'],
      redirectUri: msalConfig.auth?.redirectUri,
    }).catch((error) => {
      console.error('Login failed', error);
      dispatch(setAuthError('Login failed. Please try again.'));
    });
  }, [instance, searchParams, dispatch, isInitialized]);
  const handleLogout = useCallback(() => {
    if (!isInitialized) {
      console.warn('MSAL not initialized yet');
      return;
    }
    // Set logout flag to prevent auto-login
    sessionStorage.setItem('loggedOut', 'true');
    // Clear auth cookie
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Clear Redux state
    dispatch(clearAuth());
    dispatch(setIdTokenClaims(null));
    dispatch(setUserAccount(null));
    // Clear MSAL cache and active account
    instance.clearCache();
    instance.setActiveAccount(null);
    // Use MSAL's logout redirect to properly sign out from Azure AD
    instance.logoutRedirect({
      postLogoutRedirectUri: `${window.location.origin}/login`, // Redirect to login
    }).catch((error) => {
      console.error('Logout failed', error);
      // Fallback to manual redirect if MSAL logout fails
      window.location.href = '/login';
    });
  }, [dispatch, instance, isInitialized]);
  const authenticateWithBackend = useCallback(async (account: any) => {
    const tokenClaims = account.idTokenClaims as IdTokenClaims;
    const userProfile: UserProfile = {
      localAccountId: account.localAccountId,
      email: account.username || tokenClaims?.preferred_username || tokenClaims?.email || '',
      display_name: account.name || tokenClaims?.name || '',
      roles: tokenClaims?.roles || []
    };
    try {
      const result = await authenticateUserMutation(userProfile).unwrap();
      if (result.success) {
        dispatch(setAuthSession(result));
        return true;
      } else {
        console.error('Backend auth failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Backend auth error:', error);
      return false;
    }
  }, [authenticateUserMutation, dispatch]);
  const handleAuthActionRedirect = useCallback(async () => {
    if (!isInitialized) {
      console.warn('MSAL not initialized yet');
      return;
    }
    try {
      const response: AuthenticationResult | null = await instance.handleRedirectPromise();
      if (response?.account) {
        instance.setActiveAccount(response.account);
        if (response.account.localAccountId) {
          document.cookie = `userId=${response.account.localAccountId}; path=/; secure; samesite=strict`;
        }
        dispatch(setIdTokenClaims(response.idTokenClaims as IdTokenClaims));
        dispatch(setUserAccount(response.account));
        dispatch(setUserAuthenticated(true));
        const backendSuccess = await authenticateWithBackend(response.account);
        if (backendSuccess) {
          const returnUrl = sessionStorage.getItem('returnUrl') || '/';
          sessionStorage.removeItem('returnUrl');
          router.push(returnUrl);
        } else {
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Redirect handling error:', error);
      dispatch(setAuthError('Authentication failed'));
      handleLogout();
    }
  }, [instance, router, dispatch, handleLogout, authenticateWithBackend, isInitialized]);
  return {
    handleLogin,
    handleLogout,
    handleAuthActionRedirect,
    isAuthenticated,
    isFullyAuthenticated: isAuthenticated && authState.userAuthenticated && authState.authSession?.success,
    userAuthenticated: authState.userAuthenticated,
    isAuthenticating,
    authError: authState.error,
    authSession: authState.authSession,
    instance,
    inProgress,
    accounts,
    isInitialized,
  };
};
export default useMsalAuthHelper;