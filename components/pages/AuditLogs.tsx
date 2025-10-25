
import React, { useState, useMemo } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { auditLogsData } from '../../data/dummyData';
import type { AuditLog } from '../../types';

export const AuditLogs: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const [channelFilter, setChannelFilter] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const filteredData = useMemo(() => {
        return auditLogsData.filter(log => {
            const statusMatch = statusFilter ? log.status === statusFilter : true;
            const channelMatch = channelFilter ? log.channel === channelFilter : true;
            const moduleMatch = moduleFilter ? log.module === moduleFilter : true;
            const dateMatch = dateFilter ? new Date(log.timestamp).toISOString().split('T')[0] === dateFilter : true;
            return statusMatch && channelMatch && moduleMatch && dateMatch;
        });
    }, [statusFilter, channelFilter, moduleFilter, dateFilter]);
    
    const statusOptions = [...new Set(auditLogsData.map(item => item.status))];
    const channelOptions = [...new Set(auditLogsData.map(item => item.channel))];
    const moduleOptions = [...new Set(auditLogsData.map(item => item.module))];

    const columns = [
        { header: 'Timestamp', accessor: 'timestamp' as keyof AuditLog, render: (item: AuditLog) => new Date(item.timestamp).toLocaleString() },
        { header: 'User', accessor: 'user' as keyof AuditLog },
        { header: 'Channel', accessor: 'channel' as keyof AuditLog },
        { header: 'Module', accessor: 'module' as keyof AuditLog },
        { header: 'Action', accessor: 'action' as keyof AuditLog },
        { header: 'Status', accessor: 'status' as keyof AuditLog, render: (item: AuditLog) => 
            <span className={item.status === 'Success' ? 'text-green-500' : 'text-red-500'}>
                {item.status}
            </span> },
    ];
    
    const resetFilters = () => {
        setStatusFilter('');
        setChannelFilter('');
        setModuleFilter('');
        setDateFilter('');
    };

    const inputClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    return (
        <Card>
            <CardTitle>Audit Logs</CardTitle>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                 <div>
                    <label htmlFor="module-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Module</label>
                    <select id="module-filter" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className={inputClasses}>
                        <option value="">All</option>
                        {moduleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClasses}>
                        <option value="">All</option>
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="channel-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Channel</label>
                    <select id="channel-filter" value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className={inputClasses}>
                        <option value="">All</option>
                        {channelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input type="date" id="date-filter" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={inputClasses} />
                </div>
                 <div className="self-end">
                    <button onClick={resetFilters} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600">
                        Reset
                    </button>
                </div>
            </div>
            
            <DataTable columns={columns} data={filteredData} />
        </Card>
    );
};
