
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { disputesData, disputeStatusOrder, usersData } from '../../data/dummyData';
import type { Dispute, DisputeStatus, DisputeComment, DisputeEvidence, User, AppNotification } from '../../types';

const StatusBadge: React.FC<{ status: Dispute['status'] }> = ({ status }) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    const statusClasses: Record<DisputeStatus, string> = {
        'New': 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100',
        'Assigned': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const formatRelativeTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
};


const DisputeCard: React.FC<{ 
    dispute: Dispute, 
    onClick: () => void, 
    onUpdate: (updates: Partial<Dispute>) => void,
    assignableUsers: User[] 
}> = ({ dispute, onClick, onUpdate, assignableUsers }) => {
    
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        onUpdate({ status: e.target.value as DisputeStatus });
    };

    const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        onUpdate({ assigned_to: e.target.value || undefined });
    };

    const selectClasses = "w-full bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-md shadow-sm text-xs py-1 px-2 focus:ring-primary-500 focus:border-primary-500 transition-colors";

    return (
        <div onClick={onClick} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-all">
            <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{dispute.dispute_id}</p>
                <StatusBadge status={dispute.status} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dispute.transaction_id}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 h-10 overflow-hidden">{dispute.dispute_reason}</p>
            
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                 <div>
                    <label htmlFor={`assignee-${dispute.dispute_id}`} className="sr-only">Assign To</label>
                    <select 
                        id={`assignee-${dispute.dispute_id}`}
                        value={dispute.assigned_to || ''}
                        onChange={handleAssigneeChange}
                        onClick={(e) => e.stopPropagation()}
                        className={selectClasses}
                    >
                        <option value="">Assign to...</option>
                        {assignableUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor={`status-${dispute.dispute_id}`} className="sr-only">Change Status</label>
                    <select 
                        id={`status-${dispute.dispute_id}`}
                        value={dispute.status}
                        onChange={handleStatusChange}
                        onClick={(e) => e.stopPropagation()}
                        className={selectClasses}
                    >
                        {disputeStatusOrder.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-end mt-3">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">₹{dispute.txn_amount.toLocaleString('en-IN')}</span>
                <div className="text-right text-xs">
                    <p className="text-red-500">Due: {dispute.resolution_deadline}</p>
                    <p className="text-gray-500 dark:text-gray-400">{formatRelativeTime(dispute.last_updated)}</p>
                </div>
            </div>
        </div>
    );
};


const DisputeDetailPanel: React.FC<{ dispute: Dispute; onClose: () => void; onUpdate: (id: string, updates: Partial<Dispute>) => void; addNotification: (notification: Omit<AppNotification, 'id'>) => void; }> = ({ dispute, onClose, onUpdate, addNotification }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'comments'>('details');
    const [newComment, setNewComment] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasNewUploads, setHasNewUploads] = useState(false);

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const newCommentObj: DisputeComment = {
            id: Date.now().toString(),
            user: "Anjali Mehta",
            timestamp: new Date().toISOString(),
            comment: newComment,
        };
        const updatedComments = [...(dispute.comments || []), newCommentObj];
        onUpdate(dispute.dispute_id, { comments: updatedComments });
        
        const mentions = newComment.match(/@(\w+\s\w+)/g);
        if (mentions) {
            mentions.forEach(mention => {
                 addNotification({
                    type: 'info',
                    title: 'You were mentioned',
                    message: `Anjali Mehta mentioned you in dispute ${dispute.dispute_id}`,
                });
            });
        }
        setNewComment('');
    };
    
    const handleFilesUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setHasNewUploads(true);

        const newEvidence: DisputeEvidence[] = Array.from(files).map(file => ({
            id: `${Date.now()}-${file.name}`,
            fileName: file.name,
            fileType: file.type || 'unknown',
            uploadedBy: 'Anjali Mehta',
            timestamp: new Date().toISOString(),
        }));

        const updatedEvidence = [...(dispute.evidence || []), ...newEvidence];
        onUpdate(dispute.dispute_id, { evidence: updatedEvidence });

        addNotification({
            type: 'success',
            title: 'Evidence Uploaded',
            message: `${files.length} file(s) added to dispute ${dispute.dispute_id}.`,
        });
    };
    
    const handleCloseAttempt = () => {
        if (hasNewUploads) {
            if (window.confirm("You have added new evidence. Are you sure you want to close? The uploaded files will be kept.")) {
                onClose();
            }
        } else {
            onClose();
        }
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFilesUpload(e.dataTransfer.files); };


    return (
        <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{dispute.dispute_id}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{dispute.transaction_id}</p>
                    </div>
                    <button onClick={handleCloseAttempt} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Details</button>
                        <button onClick={() => setActiveTab('evidence')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'evidence' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Evidence</button>
                        <button onClick={() => setActiveTab('comments')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'comments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Comments</button>
                    </nav>
                </div>
                
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === 'details' && (
                    <>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Dispute Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Status:</span> <StatusBadge status={dispute.status}/></div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Amount:</span> ₹{dispute.txn_amount.toLocaleString()}</div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Channel:</span> {dispute.channel}</div>
                                <div><span className="font-medium text-gray-500 dark:text-gray-400">Raised Date:</span> {dispute.raised_date}</div>
                                <div className="col-span-2"><span className="font-medium text-gray-500 dark:text-gray-400">Reason:</span> {dispute.dispute_reason}</div>
                                <div className="col-span-2"><span className="font-medium text-gray-500 dark:text-gray-400">Deadline:</span> <span className="text-red-500 font-semibold">{dispute.resolution_deadline}</span></div>
                            </div>
                        </div>
                    </>
                    )}
                    {activeTab === 'evidence' && (
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Evidence Locker</h3>
                            <input type="file" ref={fileInputRef} onChange={(e) => handleFilesUpload(e.target.files)} multiple className="hidden" />
                            <div
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                                    isDragging
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <div className="text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">Any file type, up to 10MB</p>
                                </div>
                            </div>
                            <ul className="mt-4 space-y-2">
                                {dispute.evidence?.map(e => (
                                    <li key={e.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            <p className="text-sm font-medium truncate" title={e.fileName}>{e.fileName}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">by {e.uploadedBy}</p>
                                            <p className="text-xs text-gray-400">{formatRelativeTime(e.timestamp)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'comments' && (
                         <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Internal Comments</h3>
                            <div className="space-y-4">
                                {dispute.comments?.map(c => (
                                    <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex justify-between items-center"><p className="font-semibold text-sm">{c.user}</p><p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(c.timestamp)}</p></div>
                                        <p className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: c.comment.replace(/@(\w+\s\w+)/g, '<span class="text-primary-500 font-semibold">$&</span>') }}></p>
                                    </div>
                                ))}
                            </div>
                             <div className="mt-4">
                                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} placeholder="Add a comment... use @ to mention a user." className="block w-full text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"></textarea>
                                <button onClick={handleAddComment} className="mt-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Add Comment</button>
                             </div>
                        </div>
                    )}

                </main>
                <footer className="flex-shrink-0 flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-x-3">
                     <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">Update Status</button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                        Draft Response
                    </button>
                </footer>
            </div>
        </div>
    );
};


export const DisputeManagement: React.FC<{ initialFilters?: Record<string, any>, addNotification: (notification: Omit<AppNotification, 'id'>) => void }> = ({ initialFilters, addNotification }) => {
    const [disputes, setDisputes] = useState<Dispute[]>(disputesData);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        dateRange: { start: '', end: '' },
        reason: '',
        amountRange: { min: '', max: '' },
        assignee: '',
        status: [] as string[],
    });

    useEffect(() => {
        // FIX: Added explicit check for object type to satisfy TypeScript compiler
        if (initialFilters && typeof initialFilters === 'object') {
            setFilters(prev => ({ ...prev, ...initialFilters }));
        }
    }, [initialFilters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const [category, subKey] = name.split('.');
        
        if (subKey) {
            setFilters(prev => ({
                ...prev,
                [category]: { ...prev[category as keyof typeof filters], [subKey]: value }
            }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleStatusFilterChange = (status: DisputeStatus, isChecked: boolean) => {
        setFilters(prev => {
            const newStatusSet = new Set(prev.status);
            if (isChecked) {
                newStatusSet.add(status);
            } else {
                newStatusSet.delete(status);
            }
            return { ...prev, status: Array.from(newStatusSet) };
        });
    };

    const resetFilters = () => {
        setSearchQuery('');
        setFilters({
            dateRange: { start: '', end: '' },
            reason: '',
            amountRange: { min: '', max: '' },
            assignee: '',
            status: []
        });
    };

    const userMap = useMemo(() => {
        return new Map(usersData.map(user => [user.user_id, user.name]));
    }, []);

    const assignableUsers = useMemo(() => 
        usersData.filter(u => u.role === 'Analyst' || u.role === 'Manager'),
    []);

    const disputeReasons = useMemo(() => 
        [...new Set(disputesData.map(d => d.dispute_reason))], 
    []);

    const handleUpdateDispute = (disputeId: string, updates: Partial<Dispute>) => {
        setDisputes(prevDisputes =>
            prevDisputes.map(d => {
                if (d.dispute_id === disputeId) {
                    const originalStatus = d.status;
                    const updatedDispute = { ...d, ...updates, last_updated: new Date().toISOString() };
                    
                    if (updates.assigned_to && d.assigned_to !== updates.assigned_to) {
                        addNotification({ type: 'info', title: 'Dispute Assigned', message: `${d.dispute_id} assigned to ${userMap.get(updates.assigned_to) || 'user'}`});
                    }
                    if (updates.status && originalStatus !== updates.status) {
                         addNotification({ type: 'success', title: 'Status Updated', message: `${d.dispute_id} moved to ${updates.status}`});
                    }
                    if (updates.assigned_to && originalStatus === 'New') {
                        updatedDispute.status = 'Assigned';
                    }
                    return updatedDispute;
                }
                return d;
            })
        );
        // Also update the selected dispute if it's open
        if (selectedDispute && selectedDispute.dispute_id === disputeId) {
            setSelectedDispute(prev => prev ? {...prev, ...updates} : null);
        }
    };
    
    const filteredDisputes = useMemo(() => {
        return disputes.filter(dispute => {
            const query = searchQuery.toLowerCase();
            const searchMatch = !query || dispute.dispute_id.toLowerCase().includes(query) || dispute.transaction_id.toLowerCase().includes(query);
            
            const startDateMatch = !filters.dateRange.start || new Date(dispute.raised_date) >= new Date(filters.dateRange.start);
            const endDateMatch = !filters.dateRange.end || new Date(dispute.raised_date) <= new Date(filters.dateRange.end);
            
            const reasonMatch = !filters.reason || dispute.dispute_reason === filters.reason;
            
            const minAmountMatch = !filters.amountRange.min || dispute.txn_amount >= parseFloat(filters.amountRange.min);
            const maxAmountMatch = !filters.amountRange.max || dispute.txn_amount <= parseFloat(filters.amountRange.max);

            const assigneeMatch = !filters.assignee || dispute.assigned_to === filters.assignee;
            
            const statusMatch = filters.status.length === 0 || filters.status.includes(dispute.status);

            return searchMatch && startDateMatch && endDateMatch && reasonMatch && minAmountMatch && maxAmountMatch && assigneeMatch && statusMatch;
        });
    }, [disputes, searchQuery, filters]);

    const disputesByStatus = useMemo(() => {
        const grouped: Record<DisputeStatus, Dispute[]> = { 'New': [], 'Assigned': [], 'Under Review': [], 'Resolved': [] };
        filteredDisputes.forEach(d => {
            if (grouped[d.status]) {
                grouped[d.status].push(d);
            }
        });
        return grouped;
    }, [filteredDisputes]);

    const inputClasses = "block w-full text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";


    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <CardTitle>Dispute Management Dashboard</CardTitle>
                    <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Raise New Dispute
                    </button>
                </div>
                
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                             <label className="text-sm font-medium">Search</label>
                             <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Dispute ID, Transaction ID..." className={inputClasses}/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <input type="date" name="dateRange.start" value={filters.dateRange.start} onChange={handleFilterChange} className={inputClasses}/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">End Date</label>
                            <input type="date" name="dateRange.end" value={filters.dateRange.end} onChange={handleFilterChange} className={inputClasses}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <div>
                            <label className="text-sm font-medium">Reason</label>
                            <select name="reason" value={filters.reason} onChange={handleFilterChange} className={inputClasses}>
                                <option value="">All Reasons</option>
                                {disputeReasons.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Assigned To</label>
                            <select name="assignee" value={filters.assignee} onChange={handleFilterChange} className={inputClasses}>
                                <option value="">All Users</option>
                                {assignableUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium">Min Amount</label>
                            <input type="number" name="amountRange.min" value={filters.amountRange.min} onChange={handleFilterChange} placeholder="e.g., 500" className={inputClasses}/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Max Amount</label>
                            <input type="number" name="amountRange.max" value={filters.amountRange.max} onChange={handleFilterChange} placeholder="e.g., 10000" className={inputClasses}/>
                        </div>
                    </div>
                    <div className="pt-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                            {disputeStatusOrder.map(status => (
                                <div key={status} className="flex items-center">
                                    <input
                                        id={`status-${status}`}
                                        name="status"
                                        type="checkbox"
                                        checked={filters.status.includes(status)}
                                        onChange={(e) => handleStatusFilterChange(status, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                    />
                                    <label htmlFor={`status-${status}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                                        {status}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={resetFilters} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700">
                            Reset Filters
                        </button>
                    </div>
                 </div>
            </Card>

            <div className="w-full overflow-x-auto">
                <div className="grid grid-cols-4 gap-6 min-w-[1200px]">
                    {disputeStatusOrder.map(status => (
                        <div key={status} className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                {status} 
                                <span className="ml-2 text-sm bg-primary-200 text-primary-800 dark:bg-primary-800 dark:text-primary-200 rounded-full px-2 py-0.5">
                                    {disputesByStatus[status].length}
                                </span>
                            </h3>
                            <div className="space-y-3 h-[60vh] overflow-y-auto pr-2">
                                {disputesByStatus[status].length > 0 ? disputesByStatus[status].map(d => (
                                    <DisputeCard 
                                        key={d.dispute_id} 
                                        dispute={d} 
                                        onClick={() => setSelectedDispute(d)}
                                        onUpdate={(updates) => handleUpdateDispute(d.dispute_id, updates)}
                                        assignableUsers={assignableUsers}
                                    />
                                )) : <p className="text-sm text-center text-gray-500 dark:text-gray-400 pt-4">No disputes match the current filters.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedDispute && <DisputeDetailPanel dispute={selectedDispute} onClose={() => setSelectedDispute(null)} onUpdate={handleUpdateDispute} addNotification={addNotification} />}
        </div>
    );
};
