import React, { useState, useMemo } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { usersData, auditLogsData } from '../../data/dummyData';
import type { User, AuditLog } from '../../types';
import { Modal } from '../ui/Modal';

const StatusBadge: React.FC<{ status: User['status'] }> = ({ status }) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    const statusClasses = {
        Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const UserActivityModal: React.FC<{ user: User, onClose: () => void }> = ({ user, onClose }) => {
    const userLogs = useMemo(() => auditLogsData.filter(log => log.user === user.name || log.user === user.user_id), [user]);
    
    const columns = [
        { header: 'Timestamp', accessor: 'timestamp' as keyof AuditLog, render: (item: AuditLog) => new Date(item.timestamp).toLocaleString() },
        { header: 'Module', accessor: 'module' as keyof AuditLog },
        { header: 'Action', accessor: 'action' as keyof AuditLog },
        { header: 'Status', accessor: 'status' as keyof AuditLog, render: (item: AuditLog) => 
            <span className={item.status === 'Success' ? 'text-green-500' : 'text-red-500'}>
                {item.status}
            </span> },
    ];

    return (
        <Modal title={`Activity for ${user.name}`} isOpen={true} onClose={onClose} size="3xl">
            <div className="mt-4">
                <DataTable columns={columns} data={userLogs} />
            </div>
        </Modal>
    );
}

export const UserManagement: React.FC<{ onNavigate: (pageId: string, filters: Record<string, any>) => void }> = ({ onNavigate }) => {
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [channelFilter, setChannelFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    const filteredData = useMemo(() => {
        return usersData.filter(user => {
            const statusMatch = statusFilter ? user.status === statusFilter : true;
            const roleMatch = roleFilter ? user.role === roleFilter : true;
            const channelMatch = channelFilter ? user.assigned_channels.includes(channelFilter) : true;
            return statusMatch && roleMatch && channelMatch;
        });
    }, [statusFilter, roleFilter, channelFilter]);

    const statusOptions = [...new Set(usersData.map(item => item.status))];
    const roleOptions = [...new Set(usersData.map(item => item.role))];
    const channelOptions = [...new Set(usersData.flatMap(item => item.assigned_channels))].filter(c => c !== 'All');

    const columns = [
        { header: 'User ID', accessor: 'user_id' as keyof User },
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Designation', accessor: 'designation' as keyof User },
        { header: 'Role', accessor: 'role' as keyof User },
        { header: 'Status', accessor: 'status' as keyof User, render: (item: User) => <StatusBadge status={item.status} /> },
        { header: 'Actions', accessor: 'actions' as any, render: (item: User) => (
            <button onClick={() => setSelectedUser(item)} className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                View Activity
            </button>
        )},
    ];
    
    const resetFilters = () => {
        setStatusFilter('');
        setRoleFilter('');
        setChannelFilter('');
    };

    const inputClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    return (
        <Card>
            <CardTitle>User Management</CardTitle>

            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputClasses}>
                        <option value="">All</option>
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select id="role-filter" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={inputClasses}>
                        <option value="">All</option>
                        {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="channel-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Channel</label>
                    <select id="channel-filter" value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className={inputClasses}>
                        <option value="">All</option>
                        {channelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                 <div className="self-end">
                    <button onClick={resetFilters} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600">
                        Reset
                    </button>
                </div>
            </div>

            <DataTable columns={columns} data={filteredData} />
            
            {selectedUser && <UserActivityModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </Card>
    );
};
