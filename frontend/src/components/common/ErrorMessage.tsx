import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'inline' | 'card' | 'banner';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
  variant = 'card',
}) => {
  if (variant === 'banner') {
    return (
      <div className="bg-[#FAF4F3] border-l-4 border-[#9E6056] p-4 rounded-r-xl mb-4 flex items-start justify-between">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-[#9E6056] mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-[#66322C]">{title}</h4>
            <p className="text-xs text-[#8A4F46] mt-0.5">{message}</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 inline-flex items-center text-xs font-semibold text-[#864E46] hover:text-[#66322C] bg-[#F4ECE9] hover:bg-[#EFE2DE] px-3 py-1.5 rounded-full transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EDE4D8] rounded-3xl p-6 text-center max-w-lg mx-auto my-6 shadow-xs">
      <div className="w-12 h-12 rounded-full bg-[#FAF4F3] text-[#9E6056] flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-serif-editorial text-xl font-bold text-[#2D2320] mb-1">{title}</h3>
      <p className="text-xs text-[#7A6963] mb-4 whitespace-pre-wrap">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center px-5 py-2 text-xs font-semibold text-[#FAF7F2] bg-[#9E6056] hover:bg-[#864E46] rounded-full shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
