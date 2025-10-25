
import React, { useState, useMemo } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { DataTable } from '../ui/DataTable';
import { glSummaryData, manualAdjustmentsData } from '../../data/dummyData';
import type { GLSummary, ManualAdjustment } from '../../types';

const AdjustmentStatusBadge: React.FC<{ status: ManualAdjustment['status'] }> = ({ status }) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    const statusClasses = {
        'Pending Approval': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'Approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

// FIX: Added initialFilters prop to allow for drill-down functionality from the dashboard.
export const GLTally: React.FC<{ initialFilters?: Record<string, any> }> = ({ initialFilters }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adjustments, setAdjustments] = useState<ManualAdjustment[]>(manualAdjustmentsData);

    const handleCreateAdjustment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newAdjustment: ManualAdjustment = {
            id: `ADJ${Math.floor(1000 + Math.random() * 9000)}`,
            adjustment_account: formData.get('account') as string,
            amount: parseFloat(formData.get('amount') as string),
            justification: formData.get('justification') as string,
            status: 'Pending Approval',
            created_by: 'finance.user@bank.in',
            created_at: new Date().toISOString(),
        };
        setAdjustments(prev => [newAdjustment, ...prev]);
        setIsModalOpen(false);
    };

    const filteredAdjustments = useMemo(() => {
        if (initialFilters?.status) {
            return adjustments.filter(adj => adj.status === initialFilters.status);
        }
        return adjustments;
    }, [adjustments, initialFilters]);

    const glColumns = [
        { header: 'Description', accessor: 'description' as keyof GLSummary },
        { header: 'Recon Summary (₹)', accessor: 'recon_summary_value' as keyof GLSummary, render: (item: GLSummary) => item.recon_summary_value.toLocaleString('en-IN') },
        { header: 'GL Summary (₹)', accessor: 'gl_summary_value' as keyof GLSummary, render: (item: GLSummary) => item.gl_summary_value.toLocaleString('en-IN') },
        { header: 'Difference (₹)', accessor: 'difference' as keyof GLSummary, render: (item: GLSummary) => (
            <span className={item.difference !== 0 ? 'text-red-500 font-bold' : ''}>
                {item.difference.toLocaleString('en-IN')}
            </span>
        )},
    ];

    const adjustmentColumns = [
        { header: 'ID', accessor: 'id' as keyof ManualAdjustment },
        { header: 'Account', accessor: 'adjustment_account' as keyof ManualAdjustment },
        { header: 'Amount (₹)', accessor: 'amount' as keyof ManualAdjustment, render: (item: ManualAdjustment) => item.amount.toLocaleString('en-IN') },
        { header: 'Justification', accessor: 'justification' as keyof ManualAdjustment },
        { header: 'Status', accessor: 'status' as keyof ManualAdjustment, render: (item: ManualAdjustment) => <AdjustmentStatusBadge status={item.status} /> },
        { header: 'Created By', accessor: 'created_by' as keyof ManualAdjustment },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center">
                    <CardTitle>GL Tally Comparison</CardTitle>
                </div>
                <DataTable columns={glColumns} data={glSummaryData} />
            </Card>

            <Card>
                <div className="flex justify-between items-center">
                    <CardTitle>Manual GL Adjustments</CardTitle>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Create New Adjustment
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Create manual entries for justification and posting to the General Ledger. All entries are subject to an approval workflow and are fully audited.
                </p>
                <DataTable columns={adjustmentColumns} data={filteredAdjustments} />
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                        <form onSubmit={handleCreateAdjustment}>
                            <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Manual Adjustment Entry</h2>
                            </header>
                            <main className="p-6 space-y-4">
                                <div>
                                    <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adjustment Account</label>
                                    <input type="text" name="account" id="account" required className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
                                    <input type="number" name="amount" id="amount" step="0.01" required className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label htmlFor="justification" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Justification</label>
                                    <textarea name="justification" id="justification" rows={4} required className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                            </main>
                            <footer className="flex justify-end p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Submit for Approval</button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
