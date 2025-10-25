import React, { useState } from 'react';
import { SunIcon, MoonIcon, MenuIcon, BellIcon } from './Icons';
import type { AppNotification } from '../types';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  pageTitle: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  notifications: AppNotification[];
  removeNotification: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle, isDarkMode, toggleTheme, toggleSidebar, notifications, removeNotification }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  return (
    <header className="flex-shrink-0 h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2 mr-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
           <MenuIcon/>
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{pageTitle}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label="Toggle notifications"
          >
            <BellIcon />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
            )}
          </button>
          {isNotificationsOpen && (
              <NotificationCenter 
                notifications={notifications} 
                onDismiss={removeNotification}
                onClose={() => setIsNotificationsOpen(false)}
              />
          )}
        </div>


        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src="https://picsum.photos/100/100"
            alt="User avatar"
          />
          <div className="ml-3 hidden md:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Anjali Mehta</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">recon.admin@bankA.in</p>
          </div>
        </div>
      </div>
    </header>
  );
};