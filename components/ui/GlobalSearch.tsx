import React, { useState, useEffect, useMemo } from 'react';
import { jobMonitorData, disputesData } from '../../data/dummyData';
import { SearchIcon, JobMonitorIcon, DisputeIcon } from '../Icons';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (pageId: string, filters: Record<string, any>) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const searchResults = useMemo(() => {
        if (!query) return [];

        const lowerQuery = query.toLowerCase();
        const jobResults = jobMonitorData
            .filter(job => job.job_id.toLowerCase().includes(lowerQuery))
            .map(job => ({ type: 'Job', id: job.job_id, description: `${job.channel} - ${job.job_type}`, linkTo: 'recon-hub', filters: { jobId: job.job_id } }));

        const disputeResults = disputesData
            .filter(d => d.dispute_id.toLowerCase().includes(lowerQuery) || d.transaction_id.toLowerCase().includes(lowerQuery))
            .map(d => ({ type: 'Dispute', id: d.dispute_id, description: `${d.dispute_reason} - ₹${d.txn_amount}`, linkTo: 'disputes', filters: { disputeId: d.dispute_id } }));
        
        return [...jobResults, ...disputeResults];
    }, [query]);
    
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, searchResults.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && searchResults[activeIndex]) {
                e.preventDefault();
                const item = searchResults[activeIndex];
                onNavigate(item.linkTo, item.filters);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, searchResults, onNavigate, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="flex items-start justify-center min-h-screen pt-24 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-opacity-80 transition-opacity" aria-hidden="true"></div>
                <div 
                    onClick={e => e.stopPropagation()}
                    className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full"
                >
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 p-4">
                        <SearchIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            autoFocus
                            value={query}
                            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                            placeholder="Search for jobs, disputes, transactions..."
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400"
                        />
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {searchResults.length > 0 ? (
                            <ul className="p-2 space-y-1">
                                {searchResults.map((item, index) => (
                                    <li
                                        key={`${item.type}-${item.id}`}
                                        onMouseMove={() => setActiveIndex(index)}
                                        onClick={() => onNavigate(item.linkTo, item.filters)}
                                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${index === activeIndex ? 'bg-primary-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        {item.type === 'Job' ? <JobMonitorIcon className="h-5 w-5" /> : <DisputeIcon className="h-5 w-5" />}
                                        <div>
                                            <p className={`font-semibold text-sm ${index === activeIndex ? '' : 'text-gray-900 dark:text-white'}`}>{item.id}</p>
                                            <p className={`text-xs ${index === activeIndex ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'}`}>{item.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : query && (
                            <p className="p-16 text-center text-gray-500">No results found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
