import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Создаём клиент React Query с настройками
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,                    // Повторить запрос 2 раза при ошибке
      staleTime: 5 * 60 * 1000,   // Данные свежие 5 минут
      gcTime: 10 * 60 * 1000,     // Кэш хранится 10 минут (было cacheTime)
      refetchOnWindowFocus: false, // Не обновлять при фокусе окна
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
