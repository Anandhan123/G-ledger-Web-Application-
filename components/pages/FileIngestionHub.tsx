
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { fileUploadLogsData, systemConfigData, connectionProfilesData } from '../../data/dummyData';
import type { FileUploadLog, FileUploadErrorDetail, UploadQueueItem, AppNotification, ConnectionProfile } from '../../types';

const StatusBadge: React.FC<{ status: FileUploadLog['status'] }> = ({ status }) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    const statusClasses = {
        Validated: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        Failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        Processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

// Helper to generate dummy error details
const generateErrorDetails = (log: FileUploadLog): FileUploadErrorDetail[] => {
    if (log.failed_records === 0) return [];
    const errors: FileUploadErrorDetail[] = [];
    const errorTypes = ["Invalid date format", "Missing Transaction ID", "Amount exceeds limit"];
    for (let i = 0; i < Math.min(log.failed_records, 100); i++) {
        const recordNumber = Math.floor(Math.random() * log.total_records) + 1;
        errors.push({ record_number: recordNumber, error_message: errorTypes[i % errorTypes.length], record_content: `ROW_${recordNumber},...` });
    }
    return errors;
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const UploadStatusIcon: React.FC<{ status: UploadQueueItem['status'] }> = ({ status }) => {
    switch (status) {
        case 'uploading':
            return <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" className="opacity-75"></path></svg>;
        case 'validating':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'success':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'error':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default: // 'waiting'
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
};

const UploadProgressItem: React.FC<{
    item: UploadQueueItem;
    isSelected: boolean;
    onSelectItem: (id: string) => void;
}> = ({ item, isSelected, onSelectItem }) => {
    const statusText = {
        waiting: 'Waiting...',
        uploading: `Uploading... ${item.progress}%`,
        validating: 'Validating...',
        success: 'Completed',
        error: 'Failed',
    };

    const statusColor = {
        waiting: 'text-gray-500 dark:text-gray-400',
        uploading: 'text-blue-500',
        validating: 'text-yellow-500',
        success: 'text-green-500',
        error: 'text-red-500',
    };
    
    const progressColorClass =
        item.status === 'validating' ? 'bg-yellow-500 animate-pulse' :
        item.status === 'error' ? 'bg-red-500' :
        'bg-blue-500';

    return (
        <div 
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500' : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => onSelectItem(item.id)}
        >
            <div className="flex items-center space-x-4">
                 <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                        e.stopPropagation();
                        onSelectItem(item.id);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(item.file.size)}</p>
                </div>
                <div className="flex items-center space-x-2 w-40">
                     <UploadStatusIcon status={item.status} />
                     <span className={`text-sm font-medium ${statusColor[item.status]}`}>{statusText[item.status]}</span>
                </div>
            </div>
            {(item.status === 'uploading' || item.status === 'validating' || item.status === 'error') && (
                 <div className="mt-2 ml-16">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                            className={`h-1.5 rounded-full ${progressColorClass} transition-all duration-300`} 
                            style={{ width: `${(item.status === 'validating' || item.status === 'error') ? 100 : item.progress}%` }}>
                        </div>
                    </div>
                </div>
            )}
            {item.status === 'error' && item.error && (
                <p className="mt-1 ml-16 text-xs text-red-500">{item.error}</p>
            )}
        </div>
    );
};

const ScheduleConfigModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: any) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [config, setConfig] = useState({
        jobName: 'Nightly NPCI Fetch',
        sourceType: 'SFTP',
        profileId: '1',
        filePath: '/npci/settlement/eod/',
        frequency: 'daily',
        time: '02:00',
        notifyOnSuccess: true,
        notifyOnFailure: true,
    });

    const handleSave = () => {
        onSave(config);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configure Scheduled Job</h2>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Job Name</label>
                        <input type="text" value={config.jobName} onChange={e => setConfig({...config, jobName: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Source</label>
                            <select value={config.sourceType} onChange={e => setConfig({...config, sourceType: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option>SFTP</option>
                                <option>S3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Connection Profile</label>
                            <select value={config.profileId} onChange={e => setConfig({...config, profileId: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                                {connectionProfilesData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">File Path / Pattern</label>
                        <input type="text" value={config.filePath} onChange={e => setConfig({...config, filePath: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Frequency</label>
                            <select value={config.frequency} onChange={e => setConfig({...config, frequency: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="hourly">Hourly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Time</label>
                            <input type="time" value={config.time} onChange={e => setConfig({...config, time: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                </main>
                <footer className="flex justify-end p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md text-white bg-primary-600">Save Schedule</button>
                </footer>
            </div>
        </div>
    );
};

export const FileIngestionHub: React.FC<{ addNotification: (notification: Omit<AppNotification, 'id'>) => void }> = ({ addNotification }) => {
    const [fileUploadLogs, setFileUploadLogs] = useState<FileUploadLog[]>(fileUploadLogsData);
    const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    
    // Upload Config
    const [uploadSource, setUploadSource] = useState<'local' | 'sftp' | 's3'>('local');
    const [channel, setChannel] = useState(systemConfigData.supported_channels[0]);
    const [fileType, setFileType] = useState('Bank Settlement');
    
    // Remote Fetch State
    const [profiles, setProfiles] = useState<ConnectionProfile[]>(connectionProfilesData);
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [remoteFormState, setRemoteFormState] = useState<Record<string, string>>({});
    const [saveProfile, setSaveProfile] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    
    // Log Filters
    const [logFilters, setLogFilters] = useState({ fileName: '', channel: '', status: '', date: '' });
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<FileUploadLog | null>(null);

    const errorDetails = useMemo(() => selectedLog ? generateErrorDetails(selectedLog) : [], [selectedLog]);

    const [scheduledJobs, setScheduledJobs] = useState([
        { name: 'Nightly NPCI Fetch', schedule: 'Daily at 02:00 AM', nextRun: '10h 15m', isActive: true },
        { name: 'Hourly CBS Sync', schedule: 'Hourly', nextRun: '45m', isActive: true },
        { name: 'Weekly Fraud Report', schedule: 'Weekly on Mon', nextRun: '3d 4h', isActive: false },
    ]);

    useEffect(() => {
        uploadQueue.forEach(item => { if (item.status === 'waiting') processFile(item.id); });
    }, [uploadQueue]);

    useEffect(() => {
        if (selectedProfileId) {
            const profile = profiles.find(p => p.id === selectedProfileId);
            if (profile) {
                setRemoteFormState(profile.details);
            }
        } else {
            setRemoteFormState({});
        }
        setFormErrors({});
    }, [selectedProfileId, profiles]);

    const isRetryEnabled = useMemo(() => {
        if (selectedItems.size === 0) return false;
        const selectedWithError = uploadQueue.filter(item => selectedItems.has(item.id) && item.status === 'error');
        return selectedWithError.length > 0;
    }, [selectedItems, uploadQueue]);
    
    const filteredLogs = useMemo(() => {
        return fileUploadLogs.filter(log => {
            const { fileName, channel, status, date } = logFilters;
            if (fileName && !log.file_name.toLowerCase().includes(fileName.toLowerCase())) return false;
            if (channel && log.channel !== channel) return false;
            if (status && log.status !== status) return false;
            if (date && log.upload_date !== date) return false;
            return true;
        });
    }, [fileUploadLogs, logFilters]);

    const handleLogFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLogFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetLogFilters = () => {
        setLogFilters({ fileName: '', channel: '', status: '', date: '' });
    };

    const handleSelectItem = (id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(uploadQueue.map(item => item.id));
            setSelectedItems(allIds);
        } else {
            setSelectedItems(new Set());
        }
    };
    
    const handleCancelSelected = () => {
        setUploadQueue(prev => prev.filter(item => !selectedItems.has(item.id)));
        setSelectedItems(new Set());
    };
    
    const handleRetryFailed = () => {
        setUploadQueue(prev =>
            prev.map(item => {
                if (selectedItems.has(item.id) && item.status === 'error') {
                    return { ...item, status: 'waiting', progress: 0, error: undefined };
                }
                return item;
            })
        );
        setSelectedItems(new Set());
    };

    const updateQueueItem = (id: string, updates: Partial<UploadQueueItem>) => {
        setUploadQueue(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    };

    const processFile = (id: string) => {
        updateQueueItem(id, { status: 'uploading' });
        const uploadInterval = setInterval(() => {
            setUploadQueue(prev => prev.map(item => item.id === id && item.status === 'uploading' ? { ...item, progress: Math.min(item.progress + 10, 100) } : item));
        }, 150);

        setTimeout(() => {
            clearInterval(uploadInterval);
            updateQueueItem(id, { progress: 100, status: 'validating' });
            setTimeout(() => {
                const isSuccess = Math.random() > 0.2;
                setUploadQueue(prev => {
                    const item = prev.find(i => i.id === id);
                    if (!item) return prev;
                    
                    const newLog: FileUploadLog = { file_name: item.file.name, channel: item.channel, status: isSuccess ? 'Validated' : 'Failed', total_records: Math.floor(10000 + Math.random() * 500000), valid_records: 0, failed_records: 0, upload_date: new Date().toISOString().split('T')[0] };
                    if (isSuccess) {
                        newLog.failed_records = Math.floor(Math.random() * 50);
                        newLog.valid_records = newLog.total_records - newLog.failed_records;
                    } else {
                        newLog.failed_records = Math.floor(newLog.total_records * 0.1);
                        newLog.valid_records = newLog.total_records - newLog.failed_records;
                        addNotification({ type: 'error', title: 'File Validation Failed', message: `${item.file.name} failed validation.` });
                    }
                    setFileUploadLogs(prevLogs => [newLog, ...prevLogs]);
                    
                    return prev.map(i => i.id === id ? { ...i, status: isSuccess ? 'success' : 'error', error: isSuccess ? undefined : 'File contains invalid records.' } : i);
                });
            }, 800);
        }, 1800);
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newItems: UploadQueueItem[] = Array.from(files).map(file => ({ id: `${file.name}-${Date.now()}`, file, channel, fileType, source: 'Local Upload', status: 'waiting', progress: 0 }));
        setUploadQueue(prev => [...prev, ...newItems]);
    };

    const validateForm = (data: Record<string, string>, type: 'sftp' | 's3'): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (type === 'sftp') {
            if (!data.host) errors.host = 'Host is required.';
            if (!data.username) errors.username = 'Username is required.';
            if (!data.path) errors.path = 'File path is required.';
        } else if (type === 's3') {
            if (!data.bucket) errors.bucket = 'Bucket name is required.';
            if (!data.region) errors.region = 'Region is required.';
            if (!data.accessKey) errors.accessKey = 'Access Key is required.';
            if (!data.secretKey) errors.secretKey = 'Secret Key is required.';
            if (!data.path) errors.path = 'File path is required.';
        }
        return errors;
    };


    const handleRemoteFetch = () => {
        // FIX: Added a type guard to ensure uploadSource is not 'local' before calling validateForm
        if (uploadSource === 'local') return;

        const errors = validateForm(remoteFormState, uploadSource);
        setFormErrors(errors);
        
        if (Object.keys(errors).length > 0) return;

        if (saveProfile) {
            const profileName = prompt("Please enter a name for this new connection profile:");
            if (profileName) {
                const newProfile: ConnectionProfile = {
                    id: String(Date.now()),
                    name: profileName,
                    type: uploadSource === 'sftp' ? 'SFTP' : 'S3',
                    details: { ...remoteFormState }
                };
                setProfiles(prev => [...prev, newProfile]);
                addNotification({ type: 'success', title: 'Profile Saved', message: `Connection profile "${profileName}" has been saved.`});
                setSaveProfile(false);
            }
        }
        
        const path = remoteFormState.path as string;
        const fileName = path.split('/').pop() || 'remote-file.dat';
        const mockFile = new File(["mock content"], fileName, { type: "text/plain" });
        const newItem: UploadQueueItem = { id: `${mockFile.name}-${Date.now()}`, file: mockFile, channel, fileType, source: uploadSource.toUpperCase(), status: 'waiting', progress: 0 };
        setUploadQueue(prev => [...prev, newItem]);
    }
    
    const handleToggleJob = (jobName: string) => {
        setScheduledJobs(prev => prev.map(job => job.name === jobName ? {...job, isActive: !job.isActive} : job));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); };
    const handleViewDetails = (log: FileUploadLog) => { setSelectedLog(log); setIsDetailModalOpen(true); };
    const closeModal = () => { setIsDetailModalOpen(false); setSelectedLog(null); };
    
    const logTableColumns = [
        { header: 'File Name', accessor: 'file_name' as keyof FileUploadLog, render: (item: FileUploadLog) => <span className="font-medium">{item.file_name}</span> },
        { header: 'Channel', accessor: 'channel' as keyof FileUploadLog },
        { header: 'Status', accessor: 'status' as keyof FileUploadLog, render: (item: FileUploadLog) => <StatusBadge status={item.status} /> },
        { header: 'Total Records', accessor: 'total_records' as keyof FileUploadLog, render: (item: FileUploadLog) => item.total_records.toLocaleString() },
        { header: 'Failed Records', accessor: 'failed_records' as keyof FileUploadLog, render: (item: FileUploadLog) => <span className={item.failed_records > 0 ? 'text-red-500 font-semibold' : ''}>{item.failed_records.toLocaleString()}</span> },
        { header: 'Actions', accessor: 'actions' as any, render: (item: FileUploadLog) => <button onClick={() => handleViewDetails(item)} className="px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">View Details</button> },
    ];
    
    const errorColumns = [ { header: 'Record Number', accessor: 'record_number' as keyof FileUploadErrorDetail }, { header: 'Error Message', accessor: 'error_message' as keyof FileUploadErrorDetail }, { header: 'Record Content', accessor: 'record_content' as keyof FileUploadErrorDetail }, ];
    const inputClasses = "mt-1 block w-full text-base border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600";
    const remoteInputClasses = "block w-full text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600";
    
    const bulkButtonClasses = "px-3 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed";

    const renderSourceContent = () => {
        const RemoteForm = ({ type }: { type: 'sftp' | 's3' }) => {
            const fields = type === 'sftp' ? 
                [{name: 'host', p: 'sftp.bank.com'}, {name: 'port', p: '22', type: 'number'}, {name: 'username', p: 'recon_user'}, {name: 'password', type: 'password'}, {name: 'path', p: '/recon/incoming/file.csv', span: true}] :
                [{name: 'bucket', p: 'bank-recon-data'}, {name: 'region', p: 'ap-south-1'}, {name: 'accessKey', p: ''}, {name: 'secretKey', type: 'password'}, {name: 'path', p: 'incoming/file.csv', span: true}];

            return (
                <form onSubmit={(e) => { e.preventDefault(); handleRemoteFetch(); }} noValidate className="mt-4 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">{type.toUpperCase()} Connection Details</h4>
                        <select value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)} className={`${remoteInputClasses} w-1/3`}>
                            <option value="">Select a Profile</option>
                            {profiles.filter(p => p.type === type.toUpperCase()).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map(f => (
                        <div key={f.name} className={f.span ? 'md:col-span-2' : ''}>
                            <label className="text-sm capitalize">{f.name.replace(/([A-Z])/g, ' $1')}</label>
                            <input type={f.type || 'text'} name={f.name} placeholder={f.p} value={remoteFormState[f.name] || ''} onChange={e => setRemoteFormState(prev => ({...prev, [e.target.name]: e.target.value}))} className={`${remoteInputClasses} ${formErrors[f.name] ? 'border-red-500' : ''}`}/>
                            {formErrors[f.name] && <p className="text-xs text-red-500 mt-1">{formErrors[f.name]}</p>}
                        </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                         <div className="flex items-center gap-2">
                             <input id="save-profile" type="checkbox" checked={saveProfile} onChange={(e) => setSaveProfile(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                             <label htmlFor="save-profile" className="text-sm">Save Connection Profile</label>
                         </div>
                        <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Fetch File</button>
                    </div>
                </form>
            );
        };
        
        switch(uploadSource) {
            case 'sftp': return <RemoteForm type="sftp" />;
            case 's3': return <RemoteForm type="s3" />;
            default:
                return (
                    <div 
                        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }} 
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} 
                        onDragOver={(e) => e.preventDefault()} 
                        onDrop={handleDrop} 
                        className={`mt-4 flex flex-col justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
                            ${isDragging 
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                        onClick={() => document.getElementById('file-upload-input')?.click()}
                    >
                        <input type="file" id="file-upload-input" multiple className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <p className="mt-2 text-gray-600 dark:text-gray-400"><span className="font-semibold text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">csv, dat, txt, or xml files</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardTitle>Upload Files</CardTitle>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div> <label className="block text-sm font-medium">Channel</label> <select value={channel} onChange={e => setChannel(e.target.value)} className={inputClasses}> {systemConfigData.supported_channels.map(c => <option key={c} value={c}>{c}</option>)} </select> </div>
                    <div> <label className="block text-sm font-medium">File Type</label> <select value={fileType} onChange={e => setFileType(e.target.value)} className={inputClasses}> <option>Bank Settlement</option><option>NPCI Settlement</option></select> </div>
                </div>
                 <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         {(['local', 'sftp', 's3'] as const).map(source => (
                            <button key={source} onClick={() => setUploadSource(source)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${uploadSource === source ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                {source === 'local' ? 'Local Upload' : source.toUpperCase()}
                            </button>
                         ))}
                    </nav>
                </div>
                {renderSourceContent()}
            </Card>

            <Card>
                <CardTitle>Upload Queue</CardTitle>
                {uploadQueue.length > 0 ? (
                    <>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-y border-gray-200 dark:border-gray-700 mb-3">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="select-all-checkbox"
                                    checked={uploadQueue.length > 0 && selectedItems.size === uploadQueue.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="select-all-checkbox" className="text-sm font-medium">
                                    {selectedItems.size > 0 ? `${selectedItems.size} / ${uploadQueue.length} selected` : 'Select All'}
                                </label>
                            </div>

                            {selectedItems.size > 0 && (
                                <div className="flex items-center space-x-2">
                                    <button onClick={handleRetryFailed} disabled={!isRetryEnabled} className={`${bulkButtonClasses} hover:border-yellow-500`}>Retry Failed</button>
                                    <button onClick={handleCancelSelected} className={`${bulkButtonClasses} hover:border-red-500`}>Cancel Selected</button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            {uploadQueue.map(item => (
                                <UploadProgressItem 
                                    key={item.id} 
                                    item={item} 
                                    isSelected={selectedItems.has(item.id)}
                                    onSelectItem={handleSelectItem}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 15l-3-3m0 0l3-3m-3 3h12" /></svg>
                        <p className="mt-4 font-semibold">Your upload queue is empty</p>
                        <p className="text-sm">Select files using the uploader above to begin.</p>
                    </div>
                )}
            </Card>
            
            <Card>
                 <div className="flex justify-between items-center">
                    <CardTitle>Scheduled Fetching</CardTitle>
                    <button onClick={() => setIsScheduleModalOpen(true)} className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Add New Schedule</button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">Configure the system to automatically fetch files from remote sources on a recurring schedule.</p>
                <div className="space-y-3">
                    {scheduledJobs.map(job => (
                        <div key={job.name} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border flex items-center justify-between">
                            <div className="flex items-center">
                               <span className={`w-2.5 h-2.5 rounded-full mr-3 ${job.isActive ? 'bg-green-500' : 'bg-gray-400'}`} title={job.isActive ? 'Active' : 'Paused'}></span>
                               <div>
                                    <p className="font-medium">{job.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{job.schedule} • Next Run: {job.nextRun}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleToggleJob(job.name)} title={job.isActive ? 'Pause' : 'Resume'} className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    {job.isActive ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                </button>
                                <button onClick={() => setIsScheduleModalOpen(true)} title="Edit" className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                 <button title="Delete" className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <CardTitle>File Upload Logs</CardTitle>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="lg:col-span-2">
                        <label className="text-sm font-medium">Search by filename</label>
                        <input type="text" name="fileName" value={logFilters.fileName} onChange={handleLogFilterChange} className={`${inputClasses} text-sm`} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Channel</label>
                        <select name="channel" value={logFilters.channel} onChange={handleLogFilterChange} className={`${inputClasses} text-sm`}>
                            <option value="">All</option>
                            {[...new Set(fileUploadLogs.map(l => l.channel))].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Status</label>
                         <select name="status" value={logFilters.status} onChange={handleLogFilterChange} className={`${inputClasses} text-sm`}>
                            <option value="">All</option>
                            <option value="Validated">Validated</option>
                            <option value="Failed">Failed</option>
                            <option value="Processing">Processing</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={resetLogFilters} className="px-4 py-2 border rounded-md text-sm w-full bg-white dark:bg-gray-700 hover:bg-gray-100">Reset</button>
                    </div>
                </div>
                <DataTable columns={logTableColumns} data={filteredLogs} />
            </Card>
            
            <ScheduleConfigModal 
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSave={(config) => addNotification({ type: 'success', title: 'Schedule Saved', message: `Job "${config.jobName}" has been configured.`})}
            />

            {isDetailModalOpen && selectedLog && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b"><h2 className="text-xl font-semibold">Error Details for {selectedLog.file_name}</h2><button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">X</button></header>
                         <main className="flex-1 overflow-y-auto p-6">
                           
                            {errorDetails.length > 0 ? <DataTable columns={errorColumns} data={errorDetails} /> : <div className="text-center p-8 text-gray-500">No validation errors found for this file.</div>}
                           
                        </main>
                         <footer className="flex-shrink-0 flex justify-end p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                            <button onClick={closeModal} className="px-4 py-2 text-sm rounded-md text-white bg-primary-600">Close</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};
