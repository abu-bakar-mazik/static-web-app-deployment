'use client';
import { ReactNode, useEffect } from 'react';
import { RootProvider } from './providers/RootProvider';
import UIProvider from '@/components/ui/provider';
import { poppins } from './fonts';

export default function RootLayout(props: { children: ReactNode }) {
  const { children } = props;
  return (
    <html lang="en" className={poppins.className} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Bloomsbury" />
      </head>
      <body id="root">
        <RootProvider>
          <UIProvider>{children}</UIProvider>
        </RootProvider>
      </body>
    </html>
  );
}
