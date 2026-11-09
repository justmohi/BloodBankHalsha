import React from 'react';
import { Check } from 'lucide-react';

interface BlueVerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const BlueVerifiedBadge: React.FC<BlueVerifiedBadgeProps> = ({
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const sizeConfig = {
    xs: {
      badge: 'w-3.5 h-3.5',
      icon: 'w-2 h-2 stroke-[3.5]',
      text: 'text-[10px]'
    },
    sm: {
      badge: 'w-4 h-4',
      icon: 'w-2.5 h-2.5 stroke-[3.2]',
      text: 'text-xs'
    },
    md: {
      badge: 'w-5 h-5',
      icon: 'w-3 h-3 stroke-[3]',
      text: 'text-xs'
    },
    lg: {
      badge: 'w-6 h-6',
      icon: 'w-3.5 h-3.5 stroke-[3]',
      text: 'text-sm'
    }
  }[size];

  return (
    <span 
      className={`inline-flex items-center gap-1.5 align-middle select-none ${className}`}
      title="Blue Verified Donor (3+ Verified Completed Blood Donations)"
      aria-label="Blue Verified Donor"
    >
      <span 
        className={`relative inline-flex items-center justify-center rounded-full bg-[#1D4ED8] text-white shadow-xs shrink-0 ${sizeConfig.badge}`}
      >
        {/* Subtle radial inner glow */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1E40AF] to-[#3B82F6] opacity-90" />
        <Check className={`relative text-white ${sizeConfig.icon}`} />
      </span>

      {showLabel && (
        <span className={`font-bold tracking-tight text-[#1D4ED8] ${sizeConfig.text}`}>
          Blue Verified
        </span>
      )}
    </span>
  );
};
