'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  console.log('Auth error:', error); // This will help debug the issue

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>An error occurred: {error}</p>
      <button onClick={() => window.location.href = '/logout'}>
        Return to Login
      </button>
    </div>
  );
}