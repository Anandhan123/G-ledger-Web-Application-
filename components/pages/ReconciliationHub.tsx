import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { jobMonitorData, reconRulesData, systemConfigData, unmatchedTransactionsData, automationRulesData, usersData } from '../../data/dummyData';
import type { Job, ReconRule, ReconRuleCriterion, MatchingField, UnmatchedTransaction, AutomationRule, RuleCondition, RuleAction, AppNotification, RuleConditionField, RuleConditionOperator, RuleActionType, JobErrorDetail, User } from '../../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const StatusBadge: React.FC<{ status: Job['status'] }> = ({ status }) => {
    const baseClasses = 'px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full';
    const statusClasses = {
        Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        Failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status]}`}>
            {status === 'In Progress' && <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>}
            {status}
        </span>
    );
};

const KPICard: React.FC<{ title: string; value: string; description?: string; color?: string; }> = ({ title, value, description, color = 'text-gray-900 dark:text-white' }) => (
    <Card>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className={`mt-1 text-3xl font-semibold ${color}`}>{value}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
    </Card>
);


const ManualMatchingWorkbench: React.FC<{ job: Job, onClose: () => void }> = ({ job, onClose }) => {
    const [unmatchedA, setUnmatchedA] = useState(unmatchedTransactionsData[job.job_id]?.filter(t => t.source === 'A') || []);
    const [unmatchedB, setUnmatchedB] = useState(unmatchedTransactionsData[job.job_id]?.filter(t => t.source === 'B') || []);
    const [selectedA, setSelectedA] = useState<UnmatchedTransaction | null>(null);
    const [selectedB, setSelectedB] = useState<UnmatchedTransaction | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    
    const [searchA, setSearchA] = useState('');
    const [searchB, setSearchB] = useState('');
    const [filtersA, setFiltersA] = useState({ minAmount: '', maxAmount: '', startDate: '', endDate: '' });
    const [filtersB, setFiltersB] = useState({ minAmount: '', maxAmount: '', startDate: '', endDate: '' });

    const displayedA = useMemo(() => {
        return unmatchedA.filter(t => {
            const { minAmount, maxAmount, startDate, endDate } = filtersA;
            if (minAmount && t.amount < parseFloat(minAmount)) return false;
            if (maxAmount && t.amount > parseFloat(maxAmount)) return false;
            if (startDate && new Date(t.date) < new Date(startDate)) return false;
            if (endDate && new Date(t.date) > new Date(endDate)) return false;
            
            const searchTerm = searchA.toLowerCase();
            if (searchTerm && !t.transaction_id.toLowerCase().includes(searchTerm) && !String(t.amount).includes(searchTerm)) return false;

            return true;
        });
    }, [unmatchedA, filtersA, searchA]);

    const displayedB = useMemo(() => {
        return unmatchedB.filter(t => {
            const { minAmount, maxAmount, startDate, endDate } = filtersB;
            if (minAmount && t.amount < parseFloat(minAmount)) return false;
            if (maxAmount && t.amount > parseFloat(maxAmount)) return false;
            if (startDate && new Date(t.date) < new Date(startDate)) return false;
            if (endDate && new Date(t.date) > new Date(endDate)) return false;
            
            const searchTerm = searchB.toLowerCase();
            if (searchTerm && !t.transaction_id.toLowerCase().includes(searchTerm) && !String(t.amount).includes(searchTerm)) return false;

            return true;
        });
    }, [unmatchedB, filtersB, searchB]);


    const handleMatch = () => {
        if (!selectedA || !selectedB) return;
        setUnmatchedA(prev => prev.filter(t => t.id !== selectedA.id));
        setUnmatchedB(prev => prev.filter(t => t.id !== selectedB.id));
        setSelectedA(null);
        setSelectedB(null);
    };

    const handleGetAiSuggestions = () => {
        if (displayedA.length > 0 && displayedB.length > 0) {
            for(const itemA of displayedA) {
                const potentialMatch = displayedB.find(itemB => itemB.amount === itemA.amount && itemB.date === itemA.date);
                if(potentialMatch) {
                    setAiSuggestions([itemA.id, potentialMatch.id]);
                    setSelectedA(itemA);
                    setSelectedB(potentialMatch);
                    return;
                }
            }
        }
    };
    
    const FilterControls: React.FC<{ 
        filters: typeof filtersA, 
        onFilterChange: (filters: typeof filtersA) => void 
    }> = ({ filters, onFilterChange }) => {
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onFilterChange({ ...filters, [e.target.name]: e.target.value });
        };
        const clearFilters = () => {
            onFilterChange({ minAmount: '', maxAmount: '', startDate: '', endDate: '' });
        };
        const inputClasses = "w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-xs rounded-md shadow-sm p-1.5 focus:ring-primary-500 focus:border-primary-500";
        return (
            <div className="p-2 mb-2 space-y-2 text-sm bg-gray-100 dark:bg-gray-700/50 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                    <input type="number" name="minAmount" value={filters.minAmount} onChange={handleInputChange} placeholder="Min amount" className={inputClasses} />
                    <input type="number" name="maxAmount" value={filters.maxAmount} onChange={handleInputChange} placeholder="Max amount" className={inputClasses} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleInputChange} className={inputClasses} />
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleInputChange} className={inputClasses} />
                </div>
                <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline w-full text-right">Clear Filters</button>
            </div>
        );
    };

    const TxnTable: React.FC<{ data: UnmatchedTransaction[], selected: UnmatchedTransaction | null, onSelect: (t: UnmatchedTransaction) => void }> = ({ data, selected, onSelect }) => (
        <div className="border rounded-lg h-80 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            {data.length > 0 ? data.map(t => {
                const isSuggested = aiSuggestions.includes(t.id);
                return (
                    <div key={t.id} onClick={() => onSelect(t)} className={`p-2 border-b dark:border-gray-700 cursor-pointer relative ${selected?.id === t.id ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        {isSuggested && <div className="absolute top-1 right-1 text-xs bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded-full">AI Suggestion</div>}
                        <div className="flex justify-between items-center">
                            <p className="font-mono text-sm">{t.transaction_id}</p>
                            <p className="font-semibold">₹{t.amount.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-gray-500">{t.date}</p>
                    </div>
                );
            }) : <p className="text-center text-gray-500 p-4 text-sm">No transactions match filters.</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Manual Matching Workbench for {job.job_id}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="flex-1 p-6 space-y-4 overflow-y-auto">
                     <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                             <button onClick={handleGetAiSuggestions} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M11.982 2.054a.5.5 0 00-.964 0l-1.33 4.11-4.11 1.33a.5.5 0 000 .964l4.11 1.33 1.33 4.11a.5.5 0 00.964 0l1.33-4.11 4.11-1.33a.5.5 0 000-.964l-4.11-1.33-1.33-4.11zM4.982 12.054a.5.5 0 00-.964 0l-.667 2.056-2.056.667a.5.5 0 000 .964l2.056.667.667 2.056a.5.5 0 00.964 0l.667-2.056 2.056-.667a.5.5 0 000-.964l-2.056-.667-.667-2.056z" /></svg>
                                Suggest Matches (AI)
                            </button>
                            <button onClick={handleMatch} disabled={!selectedA || !selectedB} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">Match Selected</button>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex-1">
                            <h4 className="font-semibold mb-2">Source A: CBS ({displayedA.length})</h4>
                             <div className="relative mb-2">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                </span>
                                <input type="text" placeholder="Search by ID or amount..." value={searchA} onChange={(e) => setSearchA(e.target.value)} className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm rounded-md shadow-sm pl-10 p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <FilterControls filters={filtersA} onFilterChange={setFiltersA} />
                            <TxnTable data={displayedA} selected={selectedA} onSelect={setSelectedA} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-2">Source B: Switch/NPCI ({displayedB.length})</h4>
                            <div className="relative mb-2">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                </span>
                                <input type="text" placeholder="Search by ID or amount..." value={searchB} onChange={(e) => setSearchB(e.target.value)} className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm rounded-md shadow-sm pl-10 p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <FilterControls filters={filtersB} onFilterChange={setFiltersB} />
                            <TxnTable data={displayedB} selected={selectedB} onSelect={setSelectedB} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const JobDetailPanel: React.FC<{ job: Job; onClose: () => void; onOpenMatcher: (job: Job) => void; onViewErrors: (job: Job) => void; }> = ({ job, onClose, onOpenMatcher, onViewErrors }) => {
    return (
        <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out translate-x-0">
             <div className="flex flex-col h-full">
                 <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{job.job_id}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{job.channel} - {job.job_type}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                 <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Job Summary</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div><span className="font-medium text-gray-500 dark:text-gray-400">Status:</span></div><div><StatusBadge status={job.status}/></div>
                            <div><span className="font-medium text-gray-500 dark:text-gray-400">Date:</span></div><div>{job.job_date}</div>
                            <div><span className="font-medium text-gray-500 dark:text-gray-400">Start Time:</span></div><div>{job.start_time}</div>
                            <div><span className="font-medium text-gray-500 dark:text-gray-400">End Time:</span></div><div>{job.end_time}</div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Reconciliation Outcome</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                             <div><span className="font-medium text-gray-500 dark:text-gray-400">Records Processed:</span></div><div>{job.records_processed.toLocaleString()}</div>
                             <div><span className="font-medium text-gray-500 dark:text-gray-400">Matched:</span></div><div className="text-green-600 dark:text-green-400 font-semibold">{job.matched.toLocaleString()}</div>
                             <div><span className="font-medium text-gray-500 dark:text-gray-400">Unmatched:</span></div><div className="text-yellow-600 dark:text-yellow-400 font-semibold">{job.unmatched.toLocaleString()}</div>
                             <div><span className="font-medium text-gray-500 dark:text-gray-400">Exceptions:</span></div><div className="text-red-600 dark:text-red-400 font-semibold">{job.exceptions.toLocaleString()}</div>
                        </div>
                    </div>
                     {job.status === 'Failed' && (
                        <div>
                            <h3 className="font-semibold text-red-500 mb-2">Error Log Summary</h3>
                            <pre className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md text-xs text-red-500 overflow-x-auto">
                                <code>
                                    ERROR: Could not connect to database 'CBS_PROD_DB' on host '10.0.1.54'.<br/>
                                    Reason: Connection timed out after 3000ms.<br/>
                                    Job terminated at step: FETCH_CBS_RECORDS.
                                </code>
                            </pre>
                        </div>
                    )}
                 </main>
                 <footer className="flex-shrink-0 flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-x-3">
                    {job.unmatched > 0 && (
                        <button onClick={() => { onOpenMatcher(job); onClose(); }} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                           Open Manual Matcher
                        </button>
                    )}
                    {job.status === 'Failed' && (
                        <>
                             <button onClick={() => { onViewErrors(job); onClose(); }} className="px-4 py-2 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50">
                                View Error Details
                            </button>
                            <button className="px-4 py-2 border border-yellow-500 text-sm font-medium rounded-md text-yellow-600 bg-yellow-50 hover:bg-yellow-100">Retry Job</button>
                        </>
                    )}
                 </footer>
             </div>
        </div>
    );
};

const AutomationRuleEditor: React.FC<{
    rule: AutomationRule;
    onSave: (rule: AutomationRule) => void;
    onClose: () => void;
    assignableUsers: User[];
}> = ({ rule, onSave, onClose, assignableUsers }) => {
    const [currentRule, setCurrentRule] = useState<AutomationRule>(JSON.parse(JSON.stringify(rule)));

    const inputClasses = "block w-full text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    const handleConditionChange = (index: number, field: keyof RuleCondition, value: any) => {
        const newConditions = [...currentRule.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setCurrentRule({ ...currentRule, conditions: newConditions });
    };
    
    const handleActionChange = (index: number, field: keyof RuleAction | 'details', value: any) => {
        const newActions = [...currentRule.actions];
        if (field === 'details') {
            newActions[index].details = { ...newActions[index].details, ...value };
        } else {
            newActions[index] = { ...newActions[index], [field]: value };
        }
        setCurrentRule({ ...currentRule, actions: newActions });
    };

    const addCondition = () => {
        const newCondition: RuleCondition = { id: `c${Date.now()}`, field: 'channel', operator: 'equals', value: '' };
        setCurrentRule({ ...currentRule, conditions: [...currentRule.conditions, newCondition] });
    };
    
    const addAction = () => {
        const newAction: RuleAction = { id: `a${Date.now()}`, type: 'send_notification', details: { recipient: '' } };
        setCurrentRule({ ...currentRule, actions: [...currentRule.actions, newAction] });
    };

    const removeCondition = (index: number) => {
        const newConditions = currentRule.conditions.filter((_, i) => i !== index);
        setCurrentRule({ ...currentRule, conditions: newConditions });
    };

    const removeAction = (index: number) => {
        const newActions = currentRule.actions.filter((_, i) => i !== index);
        setCurrentRule({ ...currentRule, actions: newActions });
    };

    const conditionFields: { value: RuleConditionField; label: string; type: 'select' | 'number' | 'text', options?: string[] }[] = [
        { value: 'channel', label: 'Channel', type: 'select', options: systemConfigData.supported_channels },
        { value: 'job_type', label: 'Job Type', type: 'select', options: ['Auto-Reconciliation', 'Posting', 'Report Generation'] },
        { value: 'job_status', label: 'Job Status', type: 'select', options: ['Completed', 'Failed'] },
        { value: 'unmatched_value', label: 'Unmatched Value', type: 'number' },
    ];
    
    const operatorOptions: { value: RuleConditionOperator; label: string }[] = [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
    ];

    const actionTypes: { value: RuleActionType; label: string }[] = [
        { value: 'send_notification', label: 'Send Notification' },
        { value: 'schedule_retry', label: 'Schedule Retry' },
        { value: 'assign_job_to_user', label: 'Assign Job to User' },
    ];

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex-shrink-0 p-4 border-b"><h2 className="text-xl font-semibold">{(currentRule.id.startsWith('new') ? 'Create' : 'Edit')} Automation Rule</h2></header>
                <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label className="text-sm font-medium">Rule Name</label>
                        <input type="text" value={currentRule.name} onChange={e => setCurrentRule({...currentRule, name: e.target.value})} placeholder="e.g., High-Value UPI Alert" className={inputClasses} />
                    </div>
                    {/* Conditions */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center"><h4 className="font-semibold">IF (Conditions)</h4><button onClick={addCondition} className="text-sm text-primary-600 font-medium">+ Add Condition</button></div>
                        {currentRule.conditions.map((cond, index) => (
                            <div key={cond.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                <select value={cond.field} onChange={e => handleConditionChange(index, 'field', e.target.value)} className={`${inputClasses} col-span-4`}>
                                    {conditionFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                                <select value={cond.operator} onChange={e => handleConditionChange(index, 'operator', e.target.value)} className={`${inputClasses} col-span-3`}>
                                    {operatorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <div className="col-span-4">
                                {
                                    (() => {
                                        const fieldType = conditionFields.find(f => f.value === cond.field);
                                        if (fieldType?.type === 'select') {
                                            return <select value={cond.value} onChange={e => handleConditionChange(index, 'value', e.target.value)} className={inputClasses}>
                                                    {fieldType.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                        }
                                        return <input type={fieldType?.type || 'text'} value={cond.value} onChange={e => handleConditionChange(index, 'value', e.target.value)} className={inputClasses} />
                                    })()
                                }
                                </div>
                                <button onClick={() => removeCondition(index)} className="text-red-500 hover:text-red-700 col-span-1">✖</button>
                            </div>
                        ))}
                    </div>
                    {/* Actions */}
                     <div className="space-y-3">
                        <div className="flex justify-between items-center"><h4 className="font-semibold">THEN (Actions)</h4><button onClick={addAction} className="text-sm text-primary-600 font-medium">+ Add Action</button></div>
                        {currentRule.actions.map((act, index) => (
                             <div key={act.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                 <select value={act.type} onChange={e => handleActionChange(index, 'type', e.target.value)} className={`${inputClasses} col-span-5`}>
                                     {actionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                 </select>
                                 <div className="col-span-6">
                                    {act.type === 'send_notification' && <input type="email" value={act.details.recipient || ''} onChange={e => handleActionChange(index, 'details', { recipient: e.target.value })} placeholder="recipient@bank.com" className={inputClasses}/> }
                                    {act.type === 'schedule_retry' && <div className="flex items-center gap-2"><input type="number" value={act.details.delay_minutes || ''} onChange={e => handleActionChange(index, 'details', { delay_minutes: parseInt(e.target.value) })} className={inputClasses}/> <span className="text-sm">minutes</span></div>}
                                    {act.type === 'assign_job_to_user' &&
                                        <select value={act.details.assignee_id || ''} onChange={e => handleActionChange(index, 'details', { assignee_id: e.target.value })} className={inputClasses}>
                                            <option value="">Select User</option>
                                            {assignableUsers.map(user => (
                                                <option key={user.user_id} value={user.user_id}>{user.name}</option>
                                            ))}
                                        </select>
                                    }
                                 </div>
                                  <button onClick={() => removeAction(index)} className="text-red-500 hover:text-red-700 col-span-1">✖</button>
                             </div>
                        ))}
                     </div>

                </main>
                <footer className="flex-shrink-0 flex justify-end p-4 bg-gray-50 dark:bg-gray-800/50 border-t space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
                    <button onClick={() => onSave(currentRule)} className="px-4 py-2 rounded-md text-white bg-primary-600">Save Rule</button>
                </footer>
            </div>
        </div>
    );
};

const JobErrorDetailsModal: React.FC<{ job: Job; onClose: () => void; }> = ({ job, onClose }) => {
    const errorDetails = useMemo(() => {
        if (job.status !== 'Failed') return [];
        // This can be a more complex generator, but for now, it's simple.
        return [
            { timestamp: '09:05:01 PM', step: 'FETCH_CBS_RECORDS', errorCode: 'DB_CONN_TIMEOUT', message: "Connection to 'CBS_PROD_DB' on host '10.0.1.54' timed out after 3000ms." },
            { timestamp: '09:05:01 PM', step: 'FETCH_CBS_RECORDS', errorCode: 'NET_ERR_UNREACHABLE', message: "Network error: Host 10.0.1.54 is unreachable. Please check network connectivity and firewall rules." },
            { timestamp: '09:05:02 PM', step: 'JOB_INITIALIZATION', errorCode: 'JOB_ABORTED', message: "Job terminated due to critical error in step: FETCH_CBS_RECORDS." }
        ];
    }, [job]);

    const errorColumns = [
        { header: 'Timestamp', accessor: 'timestamp' as keyof JobErrorDetail },
        { header: 'Execution Step', accessor: 'step' as keyof JobErrorDetail },
        { header: 'Error Code', accessor: 'errorCode' as keyof JobErrorDetail, render: (item: JobErrorDetail) => <span className="font-mono bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-md text-xs">{item.errorCode}</span> },
        { header: 'Message', accessor: 'message' as keyof JobErrorDetail, render: (item: JobErrorDetail) => <span className="font-mono text-xs">{item.message}</span> },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[70vh] flex flex-col">
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Error Details for {job.job_id}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <DataTable columns={errorColumns} data={errorDetails} />
                </main>
            </div>
        </div>
    );
};

const ReconRuleEditor: React.FC<{
    rule: ReconRule;
    onSave: (rule: ReconRule) => void;
    onClose: () => void;
}> = ({ rule, onSave, onClose }) => {
    const [currentRule, setCurrentRule] = useState<ReconRule>(JSON.parse(JSON.stringify(rule)));
    
    const inputClasses = "block w-full text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";

    const matchingFields: { value: MatchingField; label: string; tolerance?: ('absolute' | 'percentage' | 'days' | 'seconds')[] }[] = [
        { value: 'transaction_id', label: 'Transaction ID' },
        { value: 'utr', label: 'UTR' },
        { value: 'rrn', label: 'RRN' },
        { value: 'card_number', label: 'Card Number' },
        { value: 'terminal_id', label: 'Terminal ID' },
        { value: 'amount', label: 'Amount', tolerance: ['absolute', 'percentage'] },
        { value: 'date', label: 'Date/Time', tolerance: ['seconds', 'days'] },
    ];

    const handleFieldChange = (key: keyof ReconRule, value: any) => {
        setCurrentRule(prev => ({ ...prev, [key]: value }));
    };
    
    const handleCriterionChange = (index: number, field: keyof ReconRuleCriterion, value: any) => {
        const newCriteria = [...currentRule.criteria];
        const criterion = { ...newCriteria[index], [field]: value };
        
        // Reset tolerance if field changes
        if(field === 'field') {
            criterion.tolerance_type = undefined;
            criterion.tolerance_value = undefined;
        }
        
        newCriteria[index] = criterion;
        setCurrentRule(prev => ({ ...prev, criteria: newCriteria }));
    };

    const addCriterion = () => {
        const newCriterion: ReconRuleCriterion = { id: `c${Date.now()}`, field: 'amount' };
        setCurrentRule(prev => ({ ...prev, criteria: [...prev.criteria, newCriterion] }));
    };
    
    const removeCriterion = (index: number) => {
        setCurrentRule(prev => ({ ...prev, criteria: prev.criteria.filter((_, i) => i !== index) }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-xl font-semibold">{(currentRule.id.startsWith('new') ? 'Create' : 'Edit')} Reconciliation Rule</h2></header>
                <main className="flex-1 p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Rule Name</label><input type="text" value={currentRule.name} onChange={e => handleFieldChange('name', e.target.value)} className={inputClasses} /></div>
                        <div><label className="text-sm font-medium">Channel</label><select value={currentRule.channel} onChange={e => handleFieldChange('channel', e.target.value)} className={inputClasses}>{systemConfigData.supported_channels.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <div><label className="text-sm font-medium">Description</label><textarea value={currentRule.description} onChange={e => handleFieldChange('description', e.target.value)} rows={2} className={inputClasses}></textarea></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div><label className="text-sm font-medium">Priority</label><input type="number" value={currentRule.priority} onChange={e => handleFieldChange('priority', parseInt(e.target.value))} className={inputClasses} /></div>
                         <div className="flex items-center space-x-2 pt-5"><input type="checkbox" id="is-active-toggle" checked={currentRule.isActive} onChange={e => handleFieldChange('isActive', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><label htmlFor="is-active-toggle" className="text-sm font-medium">Rule is Active</label></div>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mt-4 mb-2"><h4 className="font-semibold">Matching Criteria</h4><button onClick={addCriterion} className="text-sm text-primary-600 font-medium">+ Add Criterion</button></div>
                        <div className="space-y-2">
                            {currentRule.criteria.map((crit, index) => {
                                const fieldDef = matchingFields.find(f => f.value === crit.field);
                                return (
                                <div key={crit.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                    <select value={crit.field} onChange={e => handleCriterionChange(index, 'field', e.target.value)} className={`${inputClasses} col-span-4`}>
                                        {matchingFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                    <div className="col-span-7 flex gap-2">
                                        {fieldDef?.tolerance ? (
                                            <>
                                                <select value={crit.tolerance_type || ''} onChange={e => handleCriterionChange(index, 'tolerance_type', e.target.value)} className={`${inputClasses} w-1/2`}>
                                                    <option value="">No Tolerance</option>
                                                    {fieldDef.tolerance.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                                                </select>
                                                 <input type="number" placeholder="Value" value={crit.tolerance_value || ''} disabled={!crit.tolerance_type} onChange={e => handleCriterionChange(index, 'tolerance_value', parseFloat(e.target.value))} className={`${inputClasses} w-1/2`} />
                                            </>
                                        ) : <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Exact match required</p>}
                                    </div>
                                    <button onClick={() => removeCriterion(index)} className="text-red-500 hover:text-red-700 col-span-1 text-center">✖</button>
                                </div>
                            )})}
                        </div>
                     </div>
                </main>
                 <footer className="flex-shrink-0 flex justify-end p-4 bg-gray-50 dark:bg-gray-800/50 border-t space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
                    <button onClick={() => onSave(currentRule)} className="px-4 py-2 rounded-md text-white bg-primary-600">Save Rule</button>
                </footer>
            </div>
        </div>
    );
};


export const ReconciliationHub: React.FC<{ 
    initialFilters?: Record<string, any>,
    addNotification: (notification: Omit<AppNotification, 'id'>) => void;
}> = ({ initialFilters, addNotification }) => {
    const [jobs, setJobs] = useState<Job[]>(jobMonitorData);
    const [jobForManualMatch, setJobForManualMatch] = useState<Job | null>(null);
    const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
    const [automationRules, setAutomationRules] = useState<AutomationRule[]>(automationRulesData);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [selectedJobForErrors, setSelectedJobForErrors] = useState<Job | null>(null);

    // New state for reconciliation rules
    const [reconRules, setReconRules] = useState<ReconRule[]>(reconRulesData);
    const [isReconRuleModalOpen, setIsReconRuleModalOpen] = useState(false);
    const [editingReconRule, setEditingReconRule] = useState<ReconRule | null>(null);

    const kpiData = useMemo(() => {
        const completedJobs = jobs.filter(j => j.status === 'Completed');
        const totalProcessed = completedJobs.reduce((sum, j) => sum + j.records_processed, 0);
        const totalMatched = completedJobs.reduce((sum, j) => sum + j.matched, 0);
        const totalUnmatched = jobs.reduce((sum, j) => sum + j.unmatched, 0);
        
        const reconRate = totalProcessed > 0 ? ((totalMatched / totalProcessed) * 100).toFixed(2) : '0.00';
        const unmatchedValue = (totalUnmatched * 450 / 10000000).toFixed(2); // Assuming avg value of 450 INR, converting to Cr
        const jobsRequiringAction = jobs.filter(j => j.status === 'Failed' || j.exceptions > 0).length;

        return { reconRate, unmatchedValue, jobsRequiringAction };
    }, [jobs]);

    const pieChartData = useMemo(() => {
        const totalMatched = jobs.reduce((sum, j) => sum + j.matched, 0);
        const totalUnmatched = jobs.reduce((sum, j) => sum + j.unmatched, 0);
        const totalExceptions = jobs.reduce((sum, j) => sum + j.exceptions, 0);
        return [
            { name: 'Matched', value: totalMatched, color: '#10B981' },
            { name: 'Unmatched', value: totalUnmatched, color: '#F59E0B' },
            { name: 'Exceptions', value: totalExceptions, color: '#EF4444' },
        ];
    }, [jobs]);

    const assignableUsers = useMemo(() => 
        usersData.filter(u => u.role === 'Analyst' || u.role === 'Manager'),
    []);

    const userMap = useMemo(() => new Map(usersData.map(user => [user.user_id, user.name])), []);

    const generateRuleSummary = (rule: AutomationRule) => {
        const conditions = rule.conditions.map(c => {
            const field = c.field.replace(/_/g, ' ');
            const operator = {
                'equals': '=',
                'not_equals': '!=',
                'greater_than': '>',
                'less_than': '<'
            }[c.operator];
            return `${field} ${operator} ${c.value}`;
        }).join(' AND ');

        const actions = rule.actions.map(a => {
            if (a.type === 'send_notification') return `Send notification to ${a.details.recipient}`;
            if (a.type === 'schedule_retry') return `Schedule retry after ${a.details.delay_minutes} mins`;
            if (a.type === 'assign_job_to_user') {
                const userName = a.details.assignee_id ? userMap.get(a.details.assignee_id) || 'user' : 'user';
                return `Assign job to ${userName}`;
            }
            return '';
        }).join(', ');
        
        return `IF ${conditions} THEN ${actions}`;
    };

    const handleCreateRule = () => {
        const newRuleTemplate: AutomationRule = {
            id: `new-${Date.now()}`,
            name: '',
            isActive: true,
            conditions: [],
            actions: [],
        };
        setEditingRule(newRuleTemplate);
        setIsRuleModalOpen(true);
    };

    const handleEditRule = (rule: AutomationRule) => {
        setEditingRule(rule);
        setIsRuleModalOpen(true);
    };

    const handleViewErrorDetails = (job: Job) => {
        setSelectedJobForErrors(job);
        setIsErrorModalOpen(true);
    };

    const handleSaveRule = (ruleToSave: AutomationRule) => {
        let message = '';
        if (ruleToSave.id.startsWith('new')) {
            const newRule = { ...ruleToSave, id: `RULE${Math.floor(1000 + Math.random() * 9000)}` };
            setAutomationRules(prev => [newRule, ...prev]);
            message = `Rule "${newRule.name}" created successfully.`;
        } else {
            setAutomationRules(prev => prev.map(r => r.id === ruleToSave.id ? ruleToSave : r));
            message = `Rule "${ruleToSave.name}" updated successfully.`;
        }
        addNotification({ type: 'success', title: 'Automation Rule Saved', message });
        setIsRuleModalOpen(false);
        setEditingRule(null);
    };

    const handleCreateReconRule = () => {
        const newRule: ReconRule = {
            id: `new-${Date.now()}`,
            name: '',
            description: '',
            channel: systemConfigData.supported_channels[0],
            isActive: true,
            priority: reconRules.length + 1,
            criteria: [],
        };
        setEditingReconRule(newRule);
        setIsReconRuleModalOpen(true);
    };

    const handleEditReconRule = (rule: ReconRule) => {
        setEditingReconRule(rule);
        setIsReconRuleModalOpen(true);
    };

    const handleSaveReconRule = (ruleToSave: ReconRule) => {
        let message = '';
        if (ruleToSave.id.startsWith('new')) {
            const newRule = { ...ruleToSave, id: `RECON_RULE_${Math.floor(1000 + Math.random() * 9000)}`};
            setReconRules(prev => [newRule, ...prev]);
            message = `Reconciliation rule "${newRule.name}" created.`;
        } else {
            setReconRules(prev => prev.map(r => r.id === ruleToSave.id ? ruleToSave : r));
            message = `Reconciliation rule "${ruleToSave.name}" updated.`;
        }
        addNotification({ type: 'success', title: 'Rule Saved', message });
        setIsReconRuleModalOpen(false);
        setEditingReconRule(null);
    };


    const columns = [
        { header: 'Job ID', accessor: 'job_id' as keyof Job, render: (item: Job) => <span className="font-medium">{item.job_id}</span> },
        { header: 'Channel', accessor: 'channel' as keyof Job },
        { header: 'Status', accessor: 'status' as keyof Job, render: (item: Job) => <StatusBadge status={item.status} /> },
        { header: 'Unmatched', accessor: 'unmatched' as keyof Job, render: (item: Job) => <span className={`font-semibold ${item.unmatched > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>{item.unmatched.toLocaleString()}</span> },
        { header: 'Exceptions', accessor: 'exceptions' as keyof Job, render: (item: Job) => <span className={`font-semibold ${item.exceptions > 0 ? 'text-red-500' : 'text-gray-500'}`}>{item.exceptions.toLocaleString()}</span> },
        { header: 'Job Date', accessor: 'job_date' as keyof Job },
        { header: 'Actions', accessor: 'actions' as any, render: (item: Job) => (
            <div className="flex space-x-2">
                <button onClick={() => setSelectedJobForDetails(item)} className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">View Details</button>
                {item.unmatched > 0 && <button onClick={() => setJobForManualMatch(item)} className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200">Match</button>}
            </div>
        ) },
    ];
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                     <Card>
                        <CardTitle>Reconciliation Health (Today)</CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <KPICard title="Recon Success Rate" value={`${kpiData.reconRate}%`} description="Across all completed jobs" color="text-green-500" />
                            <KPICard title="Unmatched Value" value={`₹${kpiData.unmatchedValue} Cr`} description="Estimated total value pending" color="text-yellow-500" />
                            <KPICard title="Jobs Requiring Action" value={kpiData.jobsRequiringAction.toString()} description="Failed jobs or with exceptions" color="text-red-500" />
                        </div>
                     </Card>
                 </div>
                 <Card>
                    <CardTitle>Total Volume Breakdown</CardTitle>
                    <div className="w-full h-40">
                         <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={3}>
                                    {pieChartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgba(75, 85, 99, 0.8)', color: '#fff', borderRadius: '0.5rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="flex justify-center space-x-4 text-xs mt-2">
                        {pieChartData.map(entry => <span key={entry.name} className="flex items-center"><span style={{ backgroundColor: entry.color }} className="w-2.5 h-2.5 rounded-full mr-1.5"></span>{entry.name}</span>)}
                     </div>
                 </Card>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <CardTitle>Job Monitor</CardTitle>
                    <button disabled className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400">
                        Start New Reconciliation
                    </button>
                </div>
                <DataTable columns={columns} data={jobs} />
            </Card>

             <Card>
                <div className="flex justify-between items-center mb-4">
                    <CardTitle>Reconciliation Rules</CardTitle>
                     <button onClick={handleCreateReconRule} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                        Create New Rule
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage the core matching logic for the auto-reconciliation engine.</p>
                <div className="space-y-3">
                    {reconRules.map(rule => (
                        <div key={rule.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <span className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} title={rule.isActive ? 'Active' : 'Inactive'}></span>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 dark:text-white">{rule.name} <span className="ml-2 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full px-2 py-0.5">{rule.channel}</span></p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rule.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                                <button onClick={() => handleEditReconRule(rule)} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <CardTitle>Automation Rules Engine</CardTitle>
                     <button onClick={handleCreateRule} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                        Create New Rule
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Define 'if-then' rules to automate actions based on reconciliation outcomes.</p>
                <div className="space-y-3">
                    {automationRules.map(rule => (
                        <div key={rule.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white">{rule.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{generateRuleSummary(rule)}</p>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                                <label htmlFor={`toggle-${rule.id}`} className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" id={`toggle-${rule.id}`} className="sr-only" checked={rule.isActive} onChange={() => {
                                            setAutomationRules(rules => rules.map(r => r.id === rule.id ? {...r, isActive: !r.isActive} : r))
                                        }} />
                                        <div className="block bg-gray-200 dark:bg-gray-600 w-12 h-6 rounded-full"></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${rule.isActive ? 'transform translate-x-6 bg-primary-500' : ''}`}></div>
                                    </div>
                                </label>
                                <button onClick={() => handleEditRule(rule)} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {jobForManualMatch && <ManualMatchingWorkbench job={jobForManualMatch} onClose={() => setJobForManualMatch(null)} />}
            {selectedJobForDetails && <JobDetailPanel job={selectedJobForDetails} onClose={() => setSelectedJobForDetails(null)} onOpenMatcher={setJobForManualMatch} onViewErrors={handleViewErrorDetails} />}
            {isRuleModalOpen && editingRule && <AutomationRuleEditor rule={editingRule} onSave={handleSaveRule} onClose={() => { setIsRuleModalOpen(false); setEditingRule(null); }} assignableUsers={assignableUsers} />}
            {isReconRuleModalOpen && editingReconRule && <ReconRuleEditor rule={editingReconRule} onSave={handleSaveReconRule} onClose={() => { setIsReconRuleModalOpen(false); setEditingReconRule(null); }} />}
            {isErrorModalOpen && selectedJobForErrors && (
                <JobErrorDetailsModal 
                    job={selectedJobForErrors} 
                    onClose={() => {
                        setIsErrorModalOpen(false);
                        setSelectedJobForErrors(null);
                    }} 
                />
            )}
        </div>
    );
};