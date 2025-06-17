'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

type ErrorContextType = {
  showError: (message: string, title?: string) => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return ctx;
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const showError = (message: string, title = '發生錯誤') => {
    MySwal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: '確認',
    });
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
    </ErrorContext.Provider>
  );
};
