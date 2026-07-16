import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

// ─── Component ─────────────────────────────────────────────

type TransitionVariant = 'fade' | 'slide' | 'scale';

interface PageTransitionProps {
  children: ReactNode;
  variant?: TransitionVariant;
  className?: string;
}

const config: Record<TransitionVariant, {
  initial: Record<string, number>;
  animate: Record<string, number>;
  exit: Record<string, number>;
  duration?: number;
}> = {
  fade: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  slide: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.94 },
  },
};

export default function PageTransition({
  children,
  variant = 'fade',
  className,
}: PageTransitionProps) {
  const c = config[variant];

  return (
    <motion.div
      initial={c.initial}
      animate={c.animate}
      exit={c.exit}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
