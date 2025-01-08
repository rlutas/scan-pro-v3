import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="relative group">
      <div className="inline-block">{children}</div>
      <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 -mt-1 left-full ml-2 whitespace-nowrap">
        {content}
        <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
      </div>
    </div>
  );
} 