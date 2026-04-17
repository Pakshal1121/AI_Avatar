'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  isActive: boolean;
  href?: string;
  comingSoon?: boolean;
}

export default function ModuleCard({
  title,
  description,
  icon,
  isActive,
  href,
  comingSoon = false,
}: ModuleCardProps) {
  const inner = (
    <motion.div
      className={`relative block p-8 rounded-2xl border-2 transition-all duration-300 h-full ${
        isActive
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-xl hover:shadow-2xl cursor-pointer'
          : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
      }`}
      whileHover={isActive ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-slate-200 text-slate-600 text-xs font-semibold rounded-full">
          Coming Soon
        </div>
      )}

      {/* Icon */}
      <div className={`mb-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className={`text-2xl font-bold mb-2 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-sm ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
        {description}
      </p>

      {/* Active indicator */}
      {isActive && (
        <div className="mt-6 flex items-center gap-2 text-blue-600 font-medium text-sm">
          <span>Start practising</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </motion.div>
  );

  if (href && isActive) {
    return <Link href={href} className="block h-full">{inner}</Link>;
  }

  return inner;
}
