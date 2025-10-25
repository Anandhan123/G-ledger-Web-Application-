import React from 'react';
import type { AppNotification } from '../types';

interface NotificationCenterProps {
    notifications: AppNotification[];
    onDismiss: (id: string) => void;
    onClose: () => void;
}

const NotificationIcon: React.FC<{ type: AppNotification['type'] }> = ({ type }) => {
    const icons = {
        success: <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        error: <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        info: <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        warning: <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    };
    return icons[type];
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onDismiss, onClose }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
            <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className="p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700/50">
                            <NotificationIcon type={n.type} />
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{n.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                            </div>
                             <button onClick={() => onDismiss(n.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
                        </div>
                    ))
                ) : (
                    <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
                )}
            </div>
             <div className="p-2 bg-gray-50 dark:bg-gray-800/50 text-center">
                <button className="text-sm font-medium text-primary-600 dark:text-primary-400">View All</button>
            </div>
        </div>
    );
};
