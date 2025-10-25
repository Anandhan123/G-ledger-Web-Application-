import React, { useState, useMemo } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { 
    transactionAnalyticsData, actionItemsData, fileIngestionStatusData, disputesData, 
    manualAdjustmentsData, permissionChangesData, dataIntegrityChecksData,
    volumeTrendData, valueTrendData, reconSuccessTrendData, disputesTrendData
} from '../../data/dummyData';
import type { ActionItem, FileIngestionStatus, Dispute, ManualAdjustment, PermissionChange, DataIntegrityCheck, KPITrendData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

type UserRole = 'operations' | 'branch' | 'auditor';

const KPICard: React.FC<{ 
    title: string; 
    value: string; 
    trendData: KPITrendData[];
    color?: string;
    onDrillDown?: () => void;
}> = ({ title, value, trendData, color = 'text-gray-900 dark:text-white', onDrillDown }) => {
    const trendValue = ((trendData[trendData.length - 1].value - trendData[0].value) / trendData[0].value * 100).toFixed(1);
    const isPositive = parseFloat(trendValue) >= 0;

    return (
    <Card className={`flex flex-col ${onDrillDown ? 'cursor-pointer hover:shadow-lg hover:border-primary-500/50 border border-transparent' : ''}`} onClick={onDrillDown}>
        <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <p className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '▲' : '▼'} {trendValue}%
            </p>
        </div>
        <p className={`mt-1 text-3xl font-semibold ${color}`}>{value}</p>
        <div className="flex-grow w-full h-16 mt-2">
            <ResponsiveContainer>
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ display: 'none' }} />
                    <Area type="monotone" dataKey="value" stroke={isPositive ? '#10B981' : '#EF4444'} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </Card>
)};

const PriorityIndicator: React.FC<{ priority: ActionItem['priority'] }> = ({ priority }) => {
    const classes = {
        high: 'bg-red-500',
        medium: 'bg-yellow-500',
        low: 'bg-blue-500',
    };
    return <span className={`w-3 h-3 rounded-full ${classes[priority]}`}></span>;
};

const FileStatusIndicator: React.FC<{ status: FileIngestionStatus['status'] }> = ({ status }) => {
    const icon = {
        Awaiting: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        Validating: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M4 12a8 8 0 018-8v0a8 8 0 018 8v0a8 8 0 01-8 8v0a8 8 0 01-8-8v0z" /></svg>,
        Failed: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        Processed: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    return icon[status];
};


const RoleSelector: React.FC<{ currentRole: UserRole, setRole: (role: UserRole) => void }> = ({ currentRole, setRole }) => {
    const roles: { id: UserRole, name: string }[] = [
        { id: 'operations', name: 'Bank Operations' },
        { id: 'branch', name: 'Branch Manager' },
        { id: 'auditor', name: 'Auditor' },
    ];
    
    return (
        <Card className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium">Viewing As:</span>
                <div className="flex flex-wrap items-center rounded-lg p-1 bg-gray-100 dark:bg-gray-700">
                    {roles.map(role => (
                        <button 
                            key={role.id} 
                            onClick={() => setRole(role.id)} 
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${currentRole === role.id ? 'bg-primary-500 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            {role.name}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};

const OperationsView: React.FC<{ onDrillDown: (pageId: string, filters: Record<string, any>) => void }> = ({ onDrillDown }) => {
    const totalVolume = transactionAnalyticsData.reduce((acc, item) => acc + item.volume_mn, 0);
    const totalValue = transactionAnalyticsData.reduce((acc, item) => acc + item.value_bn, 0);
    const reconHealthData = { matched: 99.8, unmatched: 0.2 };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Volume (Bn)" value={(totalVolume / 1000).toFixed(2)} trendData={volumeTrendData} />
                <KPICard title="Total Value (₹ Tn)" value={(totalValue / 1000).toFixed(2)} trendData={valueTrendData} />
                <KPICard title="Reconciliation Success" value="99.85%" trendData={reconSuccessTrendData} onDrillDown={() => onDrillDown('recon-hub', {})} />
                <KPICard title="Open Disputes" value="18" trendData={disputesTrendData} onDrillDown={() => onDrillDown('disputes', { status: ['New', 'Assigned', 'Under Review'] })} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardTitle>Action Items</CardTitle>
                    <ul className="space-y-4">
                        {actionItemsData.map(item => (
                            <li key={item.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-md" onClick={() => onDrillDown(item.linkTo, item.filters || {})}>
                                <PriorityIndicator priority={item.priority} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
                                </div>
                                <span className={`text-sm font-bold ${item.priority === 'high' ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>{item.value}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card className="lg:col-span-2">
                    <CardTitle>Reconciliation Health (Today)</CardTitle>
                     <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p><p className="text-2xl font-bold text-gray-800 dark:text-gray-200">1.82 Bn</p></div>
                        <div className="cursor-pointer" onClick={() => onDrillDown('recon-hub', { status: 'unmatched' })}><p className="text-sm text-gray-500 dark:text-gray-400">Unmatched Value</p><p className="text-2xl font-bold text-red-500">₹ 2.1 Cr</p></div>
                     </div>
                     <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 flex overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${reconHealthData.matched}%` }} title={`Matched: ${reconHealthData.matched}%`}></div>
                        <div className="bg-red-500 h-full" style={{ width: `${reconHealthData.unmatched}%` }} title={`Unmatched: ${reconHealthData.unmatched}%`}></div>
                     </div>
                     <div className="flex justify-between text-sm mt-2">
                        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Matched ({reconHealthData.matched}%)</span>
                        <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Unmatched ({reconHealthData.unmatched}%)</span>
                     </div>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <CardTitle>Channel-wise Volume (Mn)</CardTitle>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                          <BarChart data={transactionAnalyticsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                              <XAxis dataKey="channel" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgba(75, 85, 99, 0.8)', color: '#fff', borderRadius: '0.5rem' }} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
                              <Bar dataKey="volume_mn" name="Volume (Mn)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="lg:col-span-2">
                    <CardTitle>File Ingestion Status (Live)</CardTitle>
                    <ul className="space-y-3">
                        {fileIngestionStatusData.map(item => (
                            <li key={item.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <FileStatusIndicator status={item.status}/>
                                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.fileName}</p><p className="text-xs text-gray-500 dark:text-gray-400">{item.channel}</p></div>
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{item.status}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

const BranchManagerView = () => {
    const CURRENT_BRANCH_ID = 'BRN001';
    
    const branchDisputes = useMemo(() => 
        disputesData.filter(d => d.branch_id === CURRENT_BRANCH_ID), 
    []);
    
    const openDisputes = branchDisputes.filter(d => d.status !== 'Resolved').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="My Branch's Open Disputes" value={openDisputes.toString()} color="text-yellow-500" trendData={disputesTrendData} />
                <KPICard title="Total Disputes This Month" value={branchDisputes.length.toString()} trendData={valueTrendData}/>
                <KPICard title="Avg. Resolution Time" value="3.2 Days" trendData={reconSuccessTrendData} />
            </div>
            <Card>
                <CardTitle>Disputes for Branch {CURRENT_BRANCH_ID}</CardTitle>
                <ul className="space-y-3">
                    {branchDisputes.map((dispute: Dispute) => (
                        <li key={dispute.dispute_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div>
                                <p className="font-semibold">{dispute.dispute_reason}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{dispute.transaction_id} - ₹{dispute.txn_amount.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                               <p className={`text-sm font-bold ${dispute.status !== 'Resolved' ? 'text-red-500' : 'text-green-500'}`}>{dispute.status}</p>
                                <p className="text-xs text-gray-400">Due: {dispute.resolution_deadline}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

const AuditorView = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardTitle>Recent Manual GL Adjustments</CardTitle>
                    <ul className="space-y-3">
                        {manualAdjustmentsData.map((adj: ManualAdjustment) => (
                           <li key={adj.id} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                               <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm">{adj.adjustment_account}</p>
                                    <p className={`text-xs font-bold ${adj.status === 'Pending Approval' ? 'text-yellow-500' : 'text-green-500'}`}>{adj.status}</p>
                               </div>
                               <p className="text-xs text-gray-500 dark:text-gray-400">By: {adj.created_by}</p>
                           </li>
                        ))}
                    </ul>
                </Card>
                <Card className="lg:col-span-2">
                    <CardTitle>Recent Permission Changes</CardTitle>
                     <ul className="space-y-3">
                        {permissionChangesData.map((change: PermissionChange) => (
                           <li key={change.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                               <div>
                                    <p className="font-semibold text-sm">{change.action}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">For user: {change.user}</p>
                               </div>
                               <p className="text-xs text-gray-400">{new Date(change.timestamp).toLocaleDateString()}</p>
                           </li>
                        ))}
                    </ul>
                </Card>
            </div>
             <Card>
                <CardTitle>Data Integrity Checks (Nightly Run)</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    {dataIntegrityChecksData.map((check: DataIntegrityCheck) => (
                        <div key={check.id} className={`p-4 rounded-lg ${check.status === 'Passed' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
                            <p className="font-semibold text-sm">{check.check_name}</p>
                            <p className={`font-bold text-lg ${check.status === 'Passed' ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'}`}>{check.status}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};


export const Dashboard: React.FC<{ onDrillDown: (pageId: string, filters: Record<string, any>) => void }> = ({ onDrillDown }) => {
    const [userRole, setUserRole] = useState<UserRole>('operations');
    
    const renderView = () => {
        switch (userRole) {
            case 'operations':
                return <OperationsView onDrillDown={onDrillDown} />;
            case 'branch':
                return <BranchManagerView />;
            case 'auditor':
                return <AuditorView />;
            default:
                return <OperationsView onDrillDown={onDrillDown} />;
        }
    };

    return (
        <div className="space-y-6">
            <RoleSelector currentRole={userRole} setRole={setUserRole} />
            {renderView()}
        </div>
    );
};