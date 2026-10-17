import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li';
}

/** Shared HMI-style panel surface: dark card, hairline border, no shadow tricks. */
export default function Panel({ children, className = '', as = 'div' }: PanelProps) {
  const Tag = as;
  return (
    <Tag className={`border border-line bg-panel ${className}`}>{children}</Tag>
  );
}
