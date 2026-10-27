'use client';

import React from 'react';
import { Bell, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-slate-900 border border-emerald-500/40 text-white rounded-lg shadow-xl p-3 flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-emerald-400">{t.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">{t.message}</p>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-white transition p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
