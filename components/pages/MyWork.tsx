import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { myWorkItemsData } from '../../data/dummyData';
import type { MyWorkItem } from '../../types';
import { AddTaskModal } from './AddTaskModal';

const formatSeconds = (seconds: number): string => {
    if (seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [
        h > 0 ? `${h}h` : '',
        m > 0 ? `${m}m` : '',
        s > 0 ? `${s}s` : ''
    ].filter(Boolean).join(' ') || '0s';
};

const TimeTracker: React.FC<{ item: MyWorkItem }> = ({ item }) => {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        if (item.status !== 'In Progress') return;
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [item.status]);

    if (item.status === 'In Progress' && item.trackingStartTime) {
        const elapsedSeconds = Math.floor((currentTime - item.trackingStartTime) / 1000);
        const totalSeconds = item.loggedTimeSeconds + elapsedSeconds;
        return <span className="font-mono text-blue-500">{formatSeconds(totalSeconds)}</span>;
    }
    
    return <span className="font-mono">{formatSeconds(item.loggedTimeSeconds)}</span>;
};


export const MyWork: React.FC<{ onNavigate: (pageId: string, filters?: Record<string, any>) => void }> = ({ onNavigate }) => {
    const [workItems, setWorkItems] = useState<MyWorkItem[]>(myWorkItemsData);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddTask = (newTaskData: Omit<MyWorkItem, 'id' | 'status' | 'loggedTimeSeconds' | 'trackingStartTime'>) => {
        const newItem: MyWorkItem = {
            id: `task-${Date.now()}`,
            ...newTaskData,
            status: 'To Do',
            loggedTimeSeconds: 0,
        };
        setWorkItems(prev => [newItem, ...prev]);
    };

    const handleTracking = (itemId: string, action: 'start' | 'stop') => {
        setWorkItems(prevItems => {
            const now = Date.now();
            // Stop any other 'In Progress' tasks
            const stoppedItems = prevItems.map(item => {
                if (item.status === 'In Progress' && item.id !== itemId) {
                    const duration = item.trackingStartTime ? Math.floor((now - item.trackingStartTime) / 1000) : 0;
                    return {
                        ...item,
                        status: 'To Do' as 'To Do',
                        loggedTimeSeconds: item.loggedTimeSeconds + duration,
                        trackingStartTime: undefined,
                    };
                }
                return item;
            });

            // Start or stop the selected task
            return stoppedItems.map(item => {
                if (item.id === itemId) {
                    if (action === 'start') {
                        return { ...item, status: 'In Progress' as 'In Progress', trackingStartTime: now };
                    } else { // stop
                        const duration = item.trackingStartTime ? Math.floor((now - item.trackingStartTime) / 1000) : 0;
                        return { ...item, status: 'To Do' as 'To Do', loggedTimeSeconds: item.loggedTimeSeconds + duration, trackingStartTime: undefined };
                    }
                }
                return item;
            });
        });
    };

    const handleMarkAsDone = (itemId: string) => {
        setWorkItems(prev => prev.map(item => {
            if (item.id === itemId) {
                let finalLoggedTime = item.loggedTimeSeconds;
                if (item.status === 'In Progress' && item.trackingStartTime) {
                    const duration = Math.floor((Date.now() - item.trackingStartTime) / 1000);
                    finalLoggedTime += duration;
                }
                return { ...item, status: 'Done' as 'Done', trackingStartTime: undefined, loggedTimeSeconds: finalLoggedTime };
            }
            return item;
        }));
    };
    
    const sortedItems = useMemo(() => [...workItems].sort((a, b) => {
        const statusOrder = { 'In Progress': 0, 'To Do': 1, 'Done': 2 };
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        
        if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
        return (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : 0;
    }), [workItems]);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>My Work Tracker</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">Here are your assigned tasks. Track your time and manage your work for the day.</p>
                    </div>
                     <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Log New Work
                    </button>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">Logged Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">Time Tracker</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedItems.map(item => (
                                <tr key={item.id} className={item.status === 'Done' ? 'opacity-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                            item.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                        }`}>{item.priority}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><TimeTracker item={item} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            {item.status === 'In Progress' ? (
                                                <button onClick={() => handleTracking(item.id, 'stop')} className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700">Stop</button>
                                            ) : item.status === 'To Do' ? (
                                                <button onClick={() => handleTracking(item.id, 'start')} className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Start</button>
                                            ) : null}
                                            {item.status !== 'Done' && (
                                                <button onClick={() => handleMarkAsDone(item.id)} className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Mark as Done</button>
                                            )}
                                            {item.linkTo && <button onClick={() => onNavigate(item.linkTo!, item.filters)} className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">View</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AddTaskModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddTask={handleAddTask}
            />
        </div>
    );
};