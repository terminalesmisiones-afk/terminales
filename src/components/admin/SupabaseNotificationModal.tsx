import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SupabaseNotificationCenter from './SupabaseNotificationCenter';

interface SupabaseNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupabaseNotificationModal: React.FC<SupabaseNotificationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Centro de Notificaciones</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <SupabaseNotificationCenter />
        </div>
      </div>
    </div>
  );
};

export default SupabaseNotificationModal;