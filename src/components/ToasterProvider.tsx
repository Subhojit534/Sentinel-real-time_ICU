'use client';
import { Toaster } from 'sonner';

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        style: {
          background: 'hsl(222, 47%, 8%)',
          border: '1px solid hsl(217, 33%, 15%)',
          color: 'hsl(210, 40%, 96%)',
          fontSize: '13px',
        },
      }}
    />
  );
}