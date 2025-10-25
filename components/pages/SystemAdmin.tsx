import React, { useState } from 'react';
import { Card, CardTitle } from '../ui/Card';
import { systemConfigData, reconRulesData, fileFormatDefinitionsData } from '../../data/dummyData';
import type { FileFormatDefinition } from '../../types';
import { DataTable } from '../ui/DataTable';


const ConfigItem: React.FC<{ label: string; value: string | string[] }> = ({ label, value }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
            {Array.isArray(value) ? 
                <div className="flex flex-wrap gap-2">
                    {value.map(v => <span key={v} className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full dark:bg-primary-900 dark:text-primary-200">{v}</span>)}
                </div>
                 : value}
        </dd>
    </div>
);

export const SystemAdmin: React.FC = () => {
    const [fileFormats, setFileFormats] = useState<FileFormatDefinition[]>(fileFormatDefinitionsData);

     const formatColumns = [
        { header: 'Name', accessor: 'name' as keyof FileFormatDefinition },
        { header: 'Channel', accessor: 'channel' as keyof FileFormatDefinition },
        { header: 'File Type', accessor: 'fileType' as keyof FileFormatDefinition },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardTitle>System Configuration</CardTitle>
                <div className="border-t border-gray-200 dark:border-gray-700">
                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                        <ConfigItem label="Bank ID" value={systemConfigData.bank_id} />
                        <ConfigItem label="Environment" value={systemConfigData.environment} />
                        <ConfigItem label="Supported Channels" value={systemConfigData.supported_channels} />
                        <ConfigItem label="Dummy Data Refresh Rate" value={systemConfigData.dummy_data_refresh_rate} />
                    </dl>
                </div>
            </Card>
            
            <Card>
                 <div className="flex justify-between items-center">
                    <CardTitle>File Format Definitions</CardTitle>
                    <button disabled className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Define New Format</button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Define and manage parsers for various incoming file formats.</p>
                <DataTable columns={formatColumns} data={fileFormats} />
            </Card>

            <Card>
                <CardTitle>Reconciliation Rules</CardTitle>
                 <div className="border-t border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {reconRulesData.map(rule => (
                            <li key={rule.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100">{rule.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
        </div>
    );
};