import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from './button';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface ResponseMessageProps {
  type: MessageType;
  title: string;
  message: string;
  details?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

const ResponseMessage: React.FC<ResponseMessageProps> = ({
  type,
  title,
  message,
  details,
  onClose,
  showCloseButton = true,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getContainerStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getContainerStyles()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-1">
            {title}
          </h3>
          <p className="text-sm mb-2">
            {message}
          </p>
          {details && (
            <p className="text-xs opacity-90">
              {details}
            </p>
          )}
        </div>
        {showCloseButton && onClose && (
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseMessage;
