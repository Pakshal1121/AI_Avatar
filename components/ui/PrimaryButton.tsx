'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export default function PrimaryButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
}: PrimaryButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200';

  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl disabled:bg-slate-300',
    secondary:
      'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 disabled:border-slate-300 disabled:text-slate-400',
    ghost: 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} disabled:cursor-not-allowed`}
    >
      {children}
    </motion.button>
  );
}
