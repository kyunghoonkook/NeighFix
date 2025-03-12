'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

let toastId = 0;

export function Toast({ title, message, type, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const bgColor = 
    type === 'success' ? 'bg-green-100 border-green-500' :
    type === 'error' ? 'bg-red-100 border-red-500' :
    type === 'warning' ? 'bg-yellow-100 border-yellow-500' :
    'bg-blue-100 border-blue-500';

  const textColor = 
    type === 'success' ? 'text-green-800' :
    type === 'error' ? 'text-red-800' :
    type === 'warning' ? 'text-yellow-800' :
    'text-blue-800';

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${bgColor} transition-all transform ease-in-out duration-300`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === 'success' && (
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'error' && (
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'warning' && (
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'info' && (
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          <div className={`mt-1 text-sm ${textColor}`}>{message}</div>
        </div>
      </div>
    </div>
  );
}

// 토스트 관리자 생성
export const toastManager = {
  toasts: [] as { id: number; props: ToastProps }[],
  subscribers: [] as ((toasts: { id: number; props: ToastProps }[]) => void)[],

  subscribe(callback: (toasts: { id: number; props: ToastProps }[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  },

  notify() {
    this.subscribers.forEach(callback => callback([...this.toasts]));
  },

  add(props: ToastProps) {
    const id = toastId++;
    this.toasts.push({ id, props });
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, props.duration || 3000);

    return id;
  },

  remove(id: number) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }
};

// 간단하게 사용할 수 있는 헬퍼 함수
export const toast = (props: ToastProps) => {
  // 클라이언트 사이드에서만 실행
  if (typeof window !== 'undefined') {
    return toastManager.add(props);
  }
  return -1;
}; 