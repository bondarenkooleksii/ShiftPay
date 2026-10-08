import React from 'react';

interface HeaderProps {
  title: string;
  subtitleOrBadge?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function Header({ title, subtitleOrBadge, rightContent }: HeaderProps) {
  return (
    <header className="h-[72px] px-8 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-[19px] font-bold text-[#0F172A] leading-tight">{title}</h1>
        {subtitleOrBadge}
      </div>

      <div className="flex items-center gap-4">{rightContent}</div>
    </header>
  );
}
