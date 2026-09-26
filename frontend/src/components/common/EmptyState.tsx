import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-[#FAF7F2] border border-dashed border-[#DDD0C0] rounded-3xl p-8 text-center my-4">
      <div className="w-12 h-12 rounded-full bg-white text-[#9E8B85] flex items-center justify-center mx-auto mb-3 border border-[#EDE4D8]">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="font-serif-editorial text-xl font-bold text-[#2D2320] mb-1">{title}</h3>
      <p className="text-xs text-[#7A6963] max-w-sm mx-auto mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-5 py-2 text-xs font-semibold text-[#FAF7F2] bg-[#9E6056] hover:bg-[#864E46] rounded-full shadow-2xs transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
