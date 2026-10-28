import React from 'react';
import Header from './Header';
import NotificationsPopover from './NotificationsPopover';
import page from '../styles/page.module.css';

interface PageHeaderProps {
  title: string;
  crumbs: string[];
  right?: React.ReactNode;
}

export default function PageHeader({ title, crumbs, right }: PageHeaderProps) {
  return (
    <Header
      title={title}
      subtitleOrBadge={
        <nav aria-label="Breadcrumb" className={page.breadcrumb}>
          {crumbs.map((c, i) => (
            <React.Fragment key={c}>
              {i > 0 && <span>/</span>}
              <span className={i === crumbs.length - 1 ? page.breadcrumbActive : undefined}>
                {c}
              </span>
            </React.Fragment>
          ))}
        </nav>
      }
      rightContent={
        <>
          {right}
          <NotificationsPopover />
        </>
      }
    />
  );
}
