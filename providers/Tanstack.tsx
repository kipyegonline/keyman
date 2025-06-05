
import React from 'react'
import { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
export default function ReactQueryProvider({children}: Readonly<{
  children: React.ReactNode;}>) {
  return (
    <QueryClientProvider client={queryClient}>
      {/** children will be provided by the app layout */}
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
