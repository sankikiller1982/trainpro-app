import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../types';

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (text: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => {
          const colors = {
            success: 'bg-[#d2f000] text-[#191e00]',
            error: 'bg-[#ffb4ab] text-[#690005]',
            info: 'bg-[#122131] text-[#d4e4fa] border border-[#454932]',
          };
          const icons = {
            success: 'check_circle',
            error: 'error',
            info: 'info',
          };
          return (
            <div
              key={toast.id}
              className={`${colors[toast.type]} font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 pointer-events-auto animate-slide-in-right`}
            >
              <span className="material-symbols-outlined text-base">{icons[toast.type]}</span>
              {toast.text}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
