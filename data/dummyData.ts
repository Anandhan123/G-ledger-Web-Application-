import type { 
  TransactionAnalytics, FileUploadLog, Job, ReportSummary, Dispute, AuditLog, User, SystemConfig, 
  ActionItem, FileIngestionStatus, ReconRule, GLSummary, ManualAdjustment, GeneratedFileLog, 
  DisputeTimelineEvent, DisputeStatus, PermissionChange, DataIntegrityCheck, KPITrendData, ConnectionProfile, UnmatchedTransaction, DisputeEvidence, DisputeComment, FileFormatDefinition, AutomationRule,
  MyWorkItem
} from '../types';

export const transactionAnalyticsData: TransactionAnalytics[] = [
  { "channel": "UPI", "volume_mn": 83751.14, "value_bn": 139206.78, "growth_percent": 3.2 },
  { "channel": "IMPS", "volume_mn": 648.23, "value_bn": 9110.37, "growth_percent": 2.8 },
  { "channel": "AEPS", "volume_mn": 462.31, "value_bn": 229.17, "growth_percent": 1.5 },
  { "channel": "NACH", "volume_mn": 940.12, "value_bn": 11960.41, "growth_percent": 4.1 },
  { "channel": "RuPay", "volume_mn": 1857.45, "value_bn": 3870.25, "growth_percent": 5.0 },
  { "channel": "NETC", "volume_mn": 327.66, "value_bn": 1182.04, "growth_percent": 2.1 },
  { "channel": "CTS", "volume_mn": 85.44, "value_bn": 5880.71, "growth_percent": 1.9 },
  { "channel": "BBPS", "volume_mn": 167.73, "value_bn": 326.72, "growth_percent": 3.4 },
  { "channel": "NFS/ATM", "volume_mn": 368.52, "value_bn": 1212.09, "growth_percent": 2.2 }
];

// Data for KPI trend charts
export const volumeTrendData: KPITrendData[] = [
  { name: 'Day 1', value: 2.8 }, { name: 'Day 2', value: 2.9 }, { name: 'Day 3', value: 3.1 },
  { name: 'Day 4', value: 3.0 }, { name: 'Day 5', value: 3.2 }, { name: 'Day 6', value: 3.3 }, { name: 'Day 7', value: 3.25 }
];
export const valueTrendData: KPITrendData[] = [
  { name: 'Day 1', value: 450 }, { name: 'Day 2', value: 460 }, { name: 'Day 3', value: 455 },
  { name: 'Day 4', value: 470 }, { name: 'Day 5', value: 480 }, { name: 'Day 6', value: 475 }, { name: 'Day 7', value: 485 }
];
export const reconSuccessTrendData: KPITrendData[] = [
  { name: 'Day 1', value: 99.7 }, { name: 'Day 2', value: 99.75 }, { name: 'Day 3', value: 99.8 },
  { name: 'Day 4', value: 99.78 }, { name: 'Day 5', value: 99.82 }, { name: 'Day 6', value: 99.81 }, { name: 'Day 7', value: 99.85 }
];
export const disputesTrendData: KPITrendData[] = [
  { name: 'Day 1', value: 22 }, { name: 'Day 2', value: 21 }, { name: 'Day 3', value: 24 },
  { name: 'Day 4', value: 20 }, { name: 'Day 5', value: 19 }, { name: 'Day 6', value: 18 }, { name: 'Day 7', value: 18 }
];

export const myWorkItemsData: MyWorkItem[] = [
    { id: '1', type: 'dispute', title: 'DPT_UPI_893201', description: 'Duplicate debit claim for ₹500', dueDate: '2025-10-17', priority: 'high', linkTo: 'disputes', status: 'To Do', loggedTimeSeconds: 3665, trackingStartTime: undefined },
    { id: '2', type: 'adjustment', title: 'ADJ002', description: 'ATM Cash Overage of ₹30,000 pending approval', priority: 'medium', linkTo: 'gl-tally', status: 'To Do', loggedTimeSeconds: 0, trackingStartTime: undefined },
    { id: '3', type: 'job_failure', title: 'JOB_RUPAY_2025_10_13_05', description: 'Report Generation failed, requires investigation', priority: 'high', linkTo: 'recon-hub', status: 'In Progress', loggedTimeSeconds: 1200, trackingStartTime: Date.now() - 300000 }, // Started 5 mins ago
    { id: '4', type: 'dispute', title: 'DPT_IMPS_246810', description: 'Credit not received by beneficiary for ₹15,000', dueDate: '2025-10-19', priority: 'medium', linkTo: 'disputes', status: 'Done', loggedTimeSeconds: 7500, trackingStartTime: undefined },
];

export const actionItemsData: ActionItem[] = [
  { id: '1', text: 'Files Failed Validation', value: '3', priority: 'high', linkTo: 'ingestion-hub' },
  { id: '2', text: 'Disputes Nearing SLA Breach', value: '5', priority: 'high', linkTo: 'disputes' },
  { id: '3', text: 'High-Value Unmatched (UPI)', value: '₹ 1.2 Cr', priority: 'medium', linkTo: 'recon-hub', filters: { status: 'unmatched', channel: 'UPI' } },
  { id: '4', text: 'Manual GL Entries Pending Approval', value: '2', priority: 'medium', linkTo: 'gl-tally', filters: { status: 'Pending Approval' } },
];

export const fileIngestionStatusData: FileIngestionStatus[] = [
  { id: '1', fileName: 'NPCI_AEPS_2025-10-15.csv', channel: 'AEPS', status: 'Awaiting' },
  { id: '2', fileName: 'SWITCH_RUPAY_2025-10-14.dat', channel: 'RuPay', status: 'Validating' },
  { id: '3', fileName: 'CBS_IMPS_2025-10-14.txt', channel: 'IMPS', status: 'Processed' },
  { id: '4', fileName: 'NPCI_UPI_2025-10-14.csv', channel: 'UPI', status: 'Failed' },
];

export const connectionProfilesData: ConnectionProfile[] = [
    { id: '1', name: 'NPCI Prod SFTP', type: 'SFTP', details: { host: 'sftp.npci.org.in', username: 'bank_prod' } },
    { id: '2', name: 'CBS UAT S3 Bucket', type: 'S3', details: { bucket: 'bank-cbs-uat-data', region: 'ap-south-1' } },
];

export const fileUploadLogsData: FileUploadLog[] = [
  { "file_name": "NPCI_UPI_Settlement_2025-09-30.csv", "channel": "UPI", "status": "Validated", "total_records": 1500000, "valid_records": 1499950, "failed_records": 50, "upload_date": "2025-09-30" },
  { "file_name": "IMPS_TTUM_2025-09-30.txt", "channel": "IMPS", "status": "Validated", "total_records": 560000, "valid_records": 560000, "failed_records": 0, "upload_date": "2025-09-30" },
  { "file_name": "AEPS_SETTLEMENT_2025-09-29.xml", "channel": "AEPS", "status": "Failed", "total_records": 23000, "valid_records": 22500, "failed_records": 500, "upload_date": "2025-09-29" },
  { "file_name": "CBS_RUPAY_TXN_2025-09-30.dat", "channel": "RuPay", "status": "Processing", "total_records": 890000, "valid_records": 0, "failed_records": 0, "upload_date": "2025-09-30" },
  { "file_name": "NACH_MMS_2025-09-30.csv", "channel": "NACH", "status": "Validated", "total_records": 45000, "valid_records": 44998, "failed_records": 2, "upload_date": "2025-09-30" },
];

export const jobMonitorData: Job[] = [
  { "job_id": "JOB_IMPS_2025_10_14_01", "channel": "IMPS", "job_type": "Auto-Reconciliation", "status": "Completed", "start_time": "10:00 AM", "end_time": "10:15 AM", "records_processed": 560000, matched: 559988, unmatched: 12, exceptions: 5, "job_date": "2025-10-14" },
  { "job_id": "JOB_UPI_2025_10_14_02", "channel": "UPI", "job_type": "Auto-Reconciliation", "status": "In Progress", "start_time": "10:15 AM", "end_time": "N/A", "records_processed": 750000, matched: 745000, unmatched: 5000, exceptions: 120, "job_date": "2025-10-14" },
  { "job_id": "JOB_RUPAY_2025_10_13_05", "channel": "RuPay", "job_type": "Report Generation", "status": "Failed", "start_time": "09:00 PM", "end_time": "09:05 PM", "records_processed": 890000, matched: 0, unmatched: 0, exceptions: 1, "job_date": "2025-10-13" },
  { "job_id": "JOB_NACH_2025_10_14_03", "channel": "NACH", "job_type": "Posting", "status": "Completed", "start_time": "10:20 AM", "end_time": "10:22 AM", "records_processed": 44998, matched: 44998, unmatched: 0, exceptions: 0, "job_date": "2025-10-14" },
  { "job_id": "JOB_AEPS_2025_10_14_04", "channel": "AEPS", "job_type": "Auto-Reconciliation", "status": "Pending", "start_time": "N/A", "end_time": "N/A", "records_processed": 0, matched: 0, unmatched: 0, exceptions: 0, "job_date": "2025-10-14" },
];

export const unmatchedTransactionsData: { [job_id: string]: UnmatchedTransaction[] } = {
    "JOB_IMPS_2025_10_14_01": [
        { id: '1a', transaction_id: 'TXN_A_111', amount: 5000, date: '2025-10-14', source: 'A' },
        { id: '1b', transaction_id: 'TXN_B_112', amount: 5000, date: '2025-10-14', source: 'B' },
        { id: '2a', transaction_id: 'TXN_A_222', amount: 1200, date: '2025-10-14', source: 'A' },
        { id: '2b', transaction_id: 'TXN_B_223', amount: 1200, date: '2025-10-14', source: 'B' },
        { id: '3a', transaction_id: 'TXN_A_333', amount: 850, date: '2025-10-14', source: 'A' },
    ],
    "JOB_UPI_2025_10_14_02": [
        { id: '4a', transaction_id: 'TXN_A_444', amount: 100, date: '2025-10-14', source: 'A' },
        { id: '4b', transaction_id: 'TXN_B_445', amount: 100, date: '2025-10-14', source: 'B' },
    ]
};

export const reconRulesData: ReconRule[] = [
  { 
    id: '1', 
    name: 'Standard UPI Recon', 
    description: 'Matches Amount, UTR, and Timestamp within 5 seconds.',
    channel: 'UPI',
    isActive: true,
    priority: 1,
    criteria: [
        { id: 'c1', field: 'amount' },
        { id: 'c2', field: 'utr' },
        { id: 'c3', field: 'date', tolerance_type: 'seconds', tolerance_value: 5 }
    ]
  },
  { 
    id: '2', 
    name: 'High-Value IMPS Recon', 
    description: 'Matches Amount, RRN. Strict matching for high value transactions.',
    channel: 'IMPS',
    isActive: true,
    priority: 1,
    criteria: [
        { id: 'c4', field: 'amount' },
        { id: 'c5', field: 'rrn' },
    ]
  },
  { 
    id: '3', 
    name: 'ATM Cash Withdrawal Recon', 
    description: 'Matches Amount, Card number, Terminal ID, and Date. Currently inactive.',
    channel: 'NFS/ATM',
    isActive: false,
    priority: 2,
    criteria: [
        { id: 'c6', field: 'amount' },
        { id: 'c7', field: 'card_number' },
        { id: 'c8', field: 'terminal_id' },
        { id: 'c9', field: 'date' },
    ]
  },
];

export const automationRulesData: AutomationRule[] = [
    {
        id: 'RULE001',
        name: 'High-Value UPI Unmatched Alert',
        isActive: true,
        conditions: [
            { id: 'c1', field: 'channel', operator: 'equals', value: 'UPI' },
            { id: 'c2', field: 'unmatched_value', operator: 'greater_than', value: 1000000 },
        ],
        actions: [
            { id: 'a1', type: 'send_notification', details: { recipient: 'settlements.manager@bank.in' } },
        ]
    },
    {
        id: 'RULE002',
        name: 'Auto-Retry Failed RuPay Jobs',
        isActive: true,
        conditions: [
            { id: 'c3', field: 'channel', operator: 'equals', value: 'RuPay' },
            { id: 'c4', field: 'job_status', operator: 'equals', value: 'Failed' },
        ],
        actions: [
            { id: 'a2', type: 'schedule_retry', details: { delay_minutes: 15 } },
        ]
    },
    {
        id: 'RULE003',
        name: 'IMPS Failure General Alert',
        isActive: false,
        conditions: [
             { id: 'c5', field: 'job_status', operator: 'equals', value: 'Failed' },
             { id: 'c6', field: 'channel', operator: 'equals', value: 'IMPS' },
        ],
        actions: [
            { id: 'a3', type: 'send_notification', details: { recipient: 'recon.team@bank.in' } },
        ]
    },
    {
        id: 'RULE004',
        name: 'Assign High Unmatched IMPS Jobs',
        isActive: true,
        conditions: [
            { id: 'c7', field: 'job_type', operator: 'equals', value: 'Auto-Reconciliation' },
            { id: 'c8', field: 'channel', operator: 'equals', value: 'IMPS' },
        ],
        actions: [
            { id: 'a4', type: 'assign_job_to_user', details: { assignee_id: 'USR_10015' } }, // Rohan Verma
        ]
    }
];

export const glSummaryData: GLSummary[] = [
  { description: 'UPI Settlement Amount', recon_summary_value: 139206780000, gl_summary_value: 139206780000, difference: 0 },
  { description: 'IMPS Net Position', recon_summary_value: 9110370000, gl_summary_value: 9110350000, difference: 20000 },
  { description: 'RuPay Interchange Fees', recon_summary_value: 38702500, gl_summary_value: 38702500, difference: 0 },
  { description: 'ATM Unreconciled Cash', recon_summary_value: 12120900, gl_summary_value: 12150900, difference: -30000 },
];

export const manualAdjustmentsData: ManualAdjustment[] = [
    { id: 'ADJ001', adjustment_account: 'IMPS Suspense Account', amount: 20000, justification: 'To match IMPS net position as per recon.', status: 'Approved', created_by: 'finance.user@bank.in', created_at: '2025-10-14T14:00:00Z' },
    { id: 'ADJ002', adjustment_account: 'ATM Cash Overage', amount: 30000, justification: 'To account for excess cash reported at ATM ID 456123.', status: 'Pending Approval', created_by: 'branch.mgr@bank.in', created_at: '2025-10-14T15:30:00Z' },
];


export const reportsData: ReportSummary[] = [
  { "channel": "NACH", "report_type": "Settlement Summary", "total_transactions": 940.12, "settled_value_bn": 11960.41, "pending_transactions": 12, "pending_value_bn": 0.25, "report_date": "2025-10-14" },
  { "channel": "UPI", "report_type": "Settlement Summary", "total_transactions": 83751.14, "settled_value_bn": 139206.78, "pending_transactions": 256, "pending_value_bn": 1.12, "report_date": "2025-10-14" },
  { "channel": "IMPS", "report_type": "Exception Report", "total_transactions": 648.23, "settled_value_bn": 9110.37, "pending_transactions": 34, "pending_value_bn": 0.55, "report_date": "2025-10-13" },
  { "channel": "RuPay", "report_type": "Settlement Summary", "total_transactions": 1857.45, "settled_value_bn": 3870.25, "pending_transactions": 89, "pending_value_bn": 0.78, "report_date": "2025-10-13" },
];

export const generatedFileLogsData: GeneratedFileLog[] = [
    { id: '1', file_name: 'TTUM_IMPS_20251014.txt', file_type: 'TTUM', channel: 'IMPS', generated_by: 'system', generated_at: '2025-10-14T11:00:00Z', status: 'Uploaded' },
    { id: '2', file_name: 'NPCI_UPI_UPDATE_20251013.csv', file_type: 'NPCI Update', channel: 'UPI', generated_by: 'anjali.mehta', generated_at: '2025-10-13T18:00:00Z', status: 'Generated' },
];

const disputeEvidence: DisputeEvidence[] = [
    { id: '1', fileName: 'customer_email.pdf', fileType: 'PDF', uploadedBy: 'branch.officer', timestamp: '2025-10-10T09:05:00Z' },
    { id: '2', fileName: 'txn_log_export.csv', fileType: 'CSV', uploadedBy: 'priya.sharma', timestamp: '2025-10-11T11:35:00Z' },
];

const disputeComments: DisputeComment[] = [
    { id: '1', user: 'priya.sharma', timestamp: '2025-10-11T11:40:00Z', comment: 'Initial logs pulled. Looks like a potential timing issue on the acquirer side. Requesting their logs now.' },
    { id: '2', user: 'anjali.mehta', timestamp: '2025-10-12T09:00:00Z', comment: '@Priya Sharma any update from the acquirer bank?' },
];

export const disputesData: Dispute[] = [
  { "dispute_id": "DPT_UPI_893201", "channel": "UPI", "transaction_id": "TXN_UPI_2394009234", "dispute_reason": "Duplicate debit", "raised_date": "2025-10-10", "status": "Under Review", "txn_amount": 500.00, "resolution_deadline": "2025-10-17", branch_id: "BRN001", assigned_to: 'USR_10016', last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), evidence: disputeEvidence, comments: disputeComments },
  { "dispute_id": "DPT_ATM_112345", "channel": "NFS/ATM", "transaction_id": "TXN_ATM_0012345678", "dispute_reason": "Cash not dispensed", "raised_date": "2025-10-09", "status": "Resolved", "txn_amount": 10000.00, "resolution_deadline": "2025-10-16", branch_id: "BRN002", assigned_to: 'USR_10015', last_updated: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), comments: [{id: '3', user: 'rohan.verma', timestamp: '2025-10-10T14:00:00Z', comment: 'Confirmed with ATM journal. Reversal processed.'}] },
  { "dispute_id": "DPT_IMPS_246810", "channel": "IMPS", "transaction_id": "TXN_IMPS_135792468", "dispute_reason": "Credit not received", "raised_date": "2025-10-12", "status": "Assigned", "txn_amount": 15000.00, "resolution_deadline": "2025-10-19", branch_id: "BRN001", assigned_to: 'USR_10016', last_updated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { "dispute_id": "DPT_UPI_13579", "channel": "UPI", "transaction_id": "TXN_UPI_9753108642", "dispute_reason": "Incorrect amount debited", "raised_date": "2025-10-14", "status": "New", "txn_amount": 999.00, "resolution_deadline": "2025-10-21", branch_id: "BRN003", assigned_to: undefined, last_updated: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { "dispute_id": "DPT_RUPAY_555111", channel: "RuPay", transaction_id: "TXN_ECOM_555111", dispute_reason: "Fraudulent Transaction", raised_date: "2025-10-13", status: "Under Review", txn_amount: 5400.00, "resolution_deadline": "2025-10-15", branch_id: "BRN002", assigned_to: 'USR_10015', last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { "dispute_id": "DPT_AEPS_999888", channel: "AEPS", transaction_id: "TXN_AEPS_999888", dispute_reason: "Transaction not initiated by customer", raised_date: "2025-10-14", status: "New", txn_amount: 2000.00, "resolution_deadline": "2025-10-16", branch_id: "BRN001", assigned_to: undefined, last_updated: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
];
export const disputeStatusOrder: DisputeStatus[] = ['New', 'Assigned', 'Under Review', 'Resolved'];

export const disputeTimelineData: { [disputeId: string]: DisputeTimelineEvent[] } = {
    "DPT_UPI_893201": [
        { id: '1', timestamp: "2025-10-10T09:00:00Z", user: "branch.officer", action: "Dispute Raised" },
        { id: '2', timestamp: "2025-10-10T10:15:00Z", user: "system", action: "Assigned to Dispute Team" },
        { id: '3', timestamp: "2025-10-11T11:30:00Z", user: "priya.sharma", action: "Status changed to Under Review", details: "Initial investigation started. Pulled transaction logs." },
        { id: '4', timestamp: "2025-10-12T16:45:00Z", user: "priya.sharma", action: "Evidence requested from acquirer bank." },
    ]
};

export const auditLogsData: AuditLog[] = [
  { "timestamp": "2025-10-14T11:25:00Z", "user": "recon.admin@bankA.in", "channel": "RuPay", "module": "Reports & Generation", "action": "Generated Settlement Report", "status": "Success" },
  { "timestamp": "2025-10-14T11:20:00Z", "user": "Anjali Mehta", "channel": "UPI", "module": "Dispute Management", "action": "Assigned Dispute DPT_UPI_893201", "status": "Success" },
  { "timestamp": "2025-10-14T10:15:00Z", "user": "system.user", "channel": "IMPS", "module": "Reconciliation Hub", "action": "Job JOB_IMPS_2025_10_14_01 finished", "status": "Success" },
  { "timestamp": "2025-10-14T10:05:00Z", "user": "settlement.officer@bankA.in", "channel": "AEPS", "module": "File Ingestion Hub", "action": "Uploaded AEPS_SETTLEMENT_2025-09-29.xml", "status": "Failure" },
  { "timestamp": "2025-10-13T09:30:00Z", "user": "Admin User", "channel": "N/A", "module": "User Management", "action": "Created user USR_20032", "status": "Success" },
  { "timestamp": "2025-10-13T15:30:00Z", "user": "Admin User", "channel": "N/A", "module": "User Management", "action": "Status for Priya Sharma changed to Inactive", "status": "Success" },
];

export const usersData: User[] = [
  { "user_id": "USR_20031", "name": "Anjali Mehta", "designation": "Settlement Officer", "assigned_channels": ["UPI", "IMPS", "AEPS"], "role": "Manager", "status": "Active" },
  { "user_id": "USR_10015", "name": "Rohan Verma", "designation": "Recon Analyst", "assigned_channels": ["RuPay", "NETC"], "role": "Analyst", "status": "Active" },
  { "user_id": "USR_00001", "name": "Admin User", "designation": "System Administrator", "assigned_channels": ["All"], "role": "Admin", "status": "Active" },
  { "user_id": "USR_10016", "name": "Priya Sharma", "designation": "Dispute Analyst", "assigned_channels": ["UPI", "NFS/ATM"], "role": "Analyst", "status": "Active" },
  { "user_id": "USR_30001", "name": "Branch Officer", "designation": "Field Officer", "assigned_channels": [], "role": "Branch Officer", "status": "Active" },
];

export const fileFormatDefinitionsData: FileFormatDefinition[] = [
    { id: '1', name: 'Standard NPCI CSV', channel: 'UPI', fileType: 'NPCI Settlement', parserConfig: { delimiter: ',', columns: ['UTR', 'Amount', 'Date'] } }
];

export const systemConfigData: SystemConfig = {
  "bank_id": "BANK_001",
  "environment": "UAT",
  "supported_channels": ["UPI", "IMPS", "AEPS", "NACH", "RuPay", "NFS/ATM"],
  "dummy_data_refresh_rate": "Every 6 hours"
};

// New data for Auditor Dashboard
export const permissionChangesData: PermissionChange[] = [
    { id: '1', user: 'Rohan Verma', action: 'Role changed to Manager', timestamp: '2025-10-14T09:00:00Z', changed_by: 'Admin User' },
    { id: '2', user: 'Priya Sharma', action: 'Status changed to Inactive', timestamp: '2025-10-13T15:30:00Z', changed_by: 'Admin User' },
    { id: '3', user: 'New User', action: 'User created with Analyst role', timestamp: '2025-10-12T11:00:00Z', changed_by: 'Admin User' },
];

export const dataIntegrityChecksData: DataIntegrityCheck[] = [
    { id: '1', check_name: 'Cross-check GL vs Recon Summary', status: 'Passed', last_run: '2025-10-15T01:00:00Z' },
    { id: '2', check_name: 'Orphaned Transaction Check', status: 'Passed', last_run: '2025-10-15T01:00:00Z' },
    { id: '3', check_name: 'Duplicate File Ingestion Check', status: 'Warning', last_run: '2025-10-15T01:00:00Z' },
];