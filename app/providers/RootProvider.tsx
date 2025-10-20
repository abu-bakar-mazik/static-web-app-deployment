import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ReactNode } from 'react';
import { MsalWrapper } from '@/components/MsalWrapper';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <MsalWrapper>
        {children}
      </MsalWrapper>
    </Provider>
  );
}
