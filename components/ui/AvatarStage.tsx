'use client';

import { motion } from 'framer-motion';

type AvatarState = 'idle' | 'speaking' | 'listening' | 'thinking';

interface AvatarStageProps {
  state?: AvatarState;
  size?: 'small' | 'medium' | 'large';
  showStateLabel?: boolean;
}

export default function AvatarStage({
  state = 'idle',
  size = 'large',
  showStateLabel = true,
}: AvatarStageProps) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64 md:w-80 md:h-80',
  };

  const stateConfig = {
    idle: {
      label: 'Ready',
      color: 'from-slate-400 to-slate-500',
      ringColor: 'ring-slate-400/30',
    },
    speaking: {
      label: 'Speaking',
      color: 'from-blue-500 to-blue-600',
      ringColor: 'ring-blue-400/50',
    },
    listening: {
      label: 'Listening',
      color: 'from-emerald-500 to-emerald-600',
      ringColor: 'ring-emerald-400/50',
    },
    thinking: {
      label: 'Thinking',
      color: 'from-amber-500 to-amber-600',
      ringColor: 'ring-amber-400/50',
    },
  };

  const currentState = stateConfig[state];

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer glow ring */}
        <motion.div
          className={`absolute inset-0 rounded-full ${currentState.ringColor} ring-8 blur-md`}
          animate={{
            scale: state === 'speaking' ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: state === 'speaking' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />

        {/* Avatar circle */}
        <motion.div
          className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${currentState.color} shadow-2xl flex items-center justify-center`}
          animate={{
            scale: state === 'listening' ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 3,
            repeat: state === 'listening' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          {/* Placeholder avatar icon */}
          <svg
            className="w-1/2 h-1/2 text-white/90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>

          {/* Thinking animation dots */}
          {state === 'thinking' && (
            <div className="absolute bottom-8 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* State label */}
      {showStateLabel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-slate-600">
            {currentState.label}
          </p>
        </motion.div>
      )}
    </div>
  );
}
