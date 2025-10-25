
import React from 'react';
import type { Page } from '../types';
import { NAV_ITEMS } from '../constants';
import { LogoIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isSidebarOpen }) => {
  return (
    <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
        <LogoIcon />
        {isSidebarOpen && <h1 className="ml-2 text-xl font-bold text-gray-800 dark:text-white">FinRecon</h1>}
      </div>
      <nav className="mt-4">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.id} className="px-4 py-1">
              <button
                onClick={() => setActivePage(item)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  activePage.id === item.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-6 w-6" />
                {isSidebarOpen && <span className="ml-4 font-medium">{item.title}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
