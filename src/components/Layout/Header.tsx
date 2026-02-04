// ===========================================
// Header Component - Breadcrumbs + User Info + Actions
// ===========================================

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface HeaderProps {
  breadcrumbs: Breadcrumb[];
  actions?: React.ReactNode;
  userName?: string;
  userRole?: string;
}

export function Header({ breadcrumbs, actions, userName, userRole }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Home size={16} />
          </button>
          
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={14} className="text-slate-400" />
              {crumb.onClick ? (
                <button
                  onClick={crumb.onClick}
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-slate-500">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Actions + User */}
        <div className="flex items-center gap-4">
          {actions}
          
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userName?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{userName || 'Admin'}</p>
              <p className="text-xs text-slate-500">{userRole || 'Administrator'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
