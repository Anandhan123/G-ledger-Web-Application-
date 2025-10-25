import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/pages/Dashboard';
import { FileIngestionHub } from './components/pages/FileIngestionHub';
import { ReconciliationHub } from './components/pages/ReconciliationHub';
import { GLTally } from './components/pages/GLTally';
import { ReportsAndGeneration } from './components/pages/ReportsAndGeneration';
import { DisputeManagement } from './components/pages/DisputeManagement';
import { AuditLogs } from './components/pages/AuditLogs';
import { UserManagement } from './components/pages/UserManagement';
import { SystemAdmin } from './components/pages/SystemAdmin';
import type { Page, AppNotification, DrillDownState } from './types';
import { NAV_ITEMS } from './constants';
import { Toast } from './components/ui/Toast';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activePage, setActivePage] = useState<Page>(NAV_ITEMS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [drillDownState, setDrillDownState] = useState<DrillDownState | null>(null);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now().toString() };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleDrillDown = useCallback((pageId: string, filters: Record<string, any>) => {
    const page = NAV_ITEMS.find(p => p.id === pageId);
    if (page) {
      setDrillDownState({ pageId, filters });
      setActivePage(page);
    }
  }, []);
  
  // Clear drill-down state after navigation
  useEffect(() => {
    if (drillDownState) {
        setDrillDownState(null);
    }
  }, [activePage]);


  const renderActivePage = () => {
    switch (activePage.id) {
      case 'dashboard':
        return <Dashboard onDrillDown={handleDrillDown} />;
      case 'ingestion-hub':
        return <FileIngestionHub addNotification={addNotification} />;
      case 'recon-hub':
        return <ReconciliationHub initialFilters={drillDownState?.pageId === 'recon-hub' ? drillDownState.filters : undefined} addNotification={addNotification} />;
      case 'gl-tally':
        return <GLTally initialFilters={drillDownState?.pageId === 'gl-tally' ? drillDownState.filters : undefined} />;
      case 'reports-generation':
        return <ReportsAndGeneration />;
      case 'disputes':
        return <DisputeManagement initialFilters={drillDownState?.pageId === 'disputes' ? drillDownState.filters : undefined} addNotification={addNotification}/>;
      case 'audit-logs':
        return <AuditLogs />;
      case 'user-management':
        return <UserManagement />;
      case 'system-admin':
        return <SystemAdmin />;
      default:
        return <Dashboard onDrillDown={handleDrillDown} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header 
          pageTitle={activePage.title} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          notifications={notifications}
          removeNotification={removeNotification}
        />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100 dark:bg-gray-950">
          {renderActivePage()}
        </main>
      </div>

       <div className="fixed top-24 right-6 z-50 space-y-3 w-80">
            {notifications.slice(0, 5).map(notification => ( // Show latest 5
                <Toast 
                    key={notification.id} 
                    notification={notification} 
                    onDismiss={() => removeNotification(notification.id)} 
                />
            ))}
        </div>
    </div>
  );
};

export default App;