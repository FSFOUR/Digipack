import React from 'react';

interface DigiPackLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const DigiPackLogo: React.FC<DigiPackLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const fontSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl sm:text-5xl',
  };

  return (
    <div className={`flex items-center gap-1.5 select-none font-black tracking-tight ${fontSizes[size]} ${className}`}>
      <span className="text-red-600">DIGI</span>
      <span className="text-current">PACK</span>
    </div>
  );
};
