import React from 'react';

export type LogoVariant = 'full' | 'icon' | 'monogram';
export type LogoTheme = 'light' | 'dark'; // 'light' means light text for dark backgrounds; 'dark' means dark text for light backgrounds

export interface IlmoraLogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  showTagline?: boolean;
  alt?: string;
  onClick?: () => void;
  priority?: boolean;
}

export const IlmoraLogo: React.FC<IlmoraLogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
  alt = 'ILMORA - Learn Today. Lead Tomorrow.',
  onClick,
}) => {
  // Determine appropriate image source based on variant & background theme
  let src = '/assets/branding/ilmora-full-logo.png';

  if (variant === 'full') {
    src =
      theme === 'dark'
        ? '/assets/branding/ilmora-full-logo-darktext.png'
        : '/assets/branding/ilmora-full-logo.png';
  } else if (variant === 'icon') {
    src = '/assets/branding/ilmora-icon.png';
  } else if (variant === 'monogram') {
    src = '/assets/branding/ilmora-monogram.png';
  }

  // Dimension presets to preserve crisp aspect ratios
  const sizeClasses: Record<string, Record<LogoVariant, string>> = {
    xs: {
      full: 'h-6 w-auto max-w-[130px]',
      icon: 'h-6 w-6',
      monogram: 'h-6 w-6',
    },
    sm: {
      full: 'h-8 w-auto max-w-[170px]',
      icon: 'h-8 w-8',
      monogram: 'h-8 w-8',
    },
    md: {
      full: 'h-10 sm:h-11 w-auto max-w-[210px]',
      icon: 'h-10 w-10',
      monogram: 'h-10 w-10',
    },
    lg: {
      full: 'h-12 sm:h-14 w-auto max-w-[260px]',
      icon: 'h-14 w-14',
      monogram: 'h-14 w-14',
    },
    xl: {
      full: 'h-16 sm:h-20 w-auto max-w-[340px]',
      icon: 'h-20 w-20',
      monogram: 'h-20 w-20',
    },
    custom: {
      full: '',
      icon: '',
      monogram: '',
    },
  };

  const selectedSizeClass = size === 'custom' ? '' : sizeClasses[size][variant];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`object-contain transition-transform duration-200 ${selectedSizeClass} ${
          onClick ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
        }`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
