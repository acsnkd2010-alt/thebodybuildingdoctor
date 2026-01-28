'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-bottom-5 ${
        type === 'success'
          ? 'bg-green-950/90 border-green-800 text-green-100'
          : 'bg-red-950/90 border-red-800 text-red-100'
      }`}
    >
      {type === 'success' ? (
        <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
      ) : (
        <XCircleIcon className="h-5 w-5 flex-shrink-0" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-current opacity-70 hover:opacity-100 transition"
        aria-label="Close"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
