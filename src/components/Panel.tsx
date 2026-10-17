import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li';
  interactive?: boolean;
  ticks?: boolean;
}

/** Shared instrument-panel surface: hairline border, inner highlight, soft depth. */
export default function Panel({ children, className = '', as = 'div', interactive = false, ticks = false }: PanelProps) {
  const Tag = as;
  return (
    <Tag className={`surface ${interactive ? 'surface-interactive' : ''} ${ticks ? 'ticks' : ''} ${className}`}>{children}</Tag>
  );
}
