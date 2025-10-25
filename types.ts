import type { ElementType } from 'react';

// Core App Types
export interface Page {
    id: string;
    title: string;
    icon: ElementType;
}

export interface AppNotification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
}

export interface ToastProps {
  notification: AppNotification;
  onDismiss: () => void;
}

export interface DrillDownState {
    pageId: string;
    filters: Record<string, any>;
}

export interface TransactionAnalytics {
  channel: string;
  volume_mn: number;
  value_bn: number;
  growth_percent: number;
}

// Dashboard Types
export interface KPITrendData {
    name: string;
    value: number;
}
export interface ActionItem {
  id: string;
  text: string;
  value: string;
  priority: 'high' | 'medium' | 'low';
  linkTo: string; // page id
  filters?: Record<string, any>;
}

export interface FileIngestionStatus {
  id: string;
  fileName: string;
  channel: string;
  status: 'Awaiting' | 'Validating' | 'Failed' | 'Processed';
}

// File Ingestion Hub Types
export interface ConnectionProfile {
    id: string;
    name: string;
    type: 'SFTP' | 'S3';
    details: Record<string, string>;
}
export interface FileUploadLog {
  file_name: string;
  channel: string;
  status: 'Validated' | 'Failed' | 'Processing';
  total_records: number;
  valid_records: number;
  failed_records: number;
  upload_date: string;
}

export interface FileUploadErrorDetail {
  record_number: number;
  error_message: string;
  record_content: string;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  channel: string;
  fileType: string;
  source: string;
  status: 'waiting' | 'uploading' | 'validating' | 'success' | 'error';
  progress: number;
  error?: string;
}

// Reconciliation Hub Types
export interface UnmatchedTransaction {
    id: string;
    transaction_id: string;
    amount: number;
    date: string;
    source: 'A' | 'B';
}
export interface Job {
  job_id: string;
  channel: string;
  job_type: 'Auto-Reconciliation' | 'Posting' | 'Report Generation';
  status: 'Completed' | 'In Progress' | 'Failed' | 'Pending';
  start_time: string;
  end_time: string;
  records_processed: number;
  matched: number;
  unmatched: number;
  exceptions: number;
  job_date: string;
}

export interface ReconRule {
  id: string;
  name: string;
  description: string;
}

export interface JobErrorDetail {
    timestamp: string;
    step: string;
    errorCode: string;
    message: string;
}

// Automation Rules Types
export type RuleConditionField = 'channel' | 'job_status' | 'unmatched_value' | 'job_type';
export type RuleConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than';
export type RuleActionType = 'send_notification' | 'schedule_retry' | 'assign_job_to_user';

export interface RuleCondition {
    id: string;
    field: RuleConditionField;
    operator: RuleConditionOperator;
    value: string | number;
}

export interface RuleAction {
    id:string;
    type: RuleActionType;
    details: {
        recipient?: string; // for notification
        delay_minutes?: number; // for retry
        assignee_id?: string; // for assign_job_to_user
    };
}

export interface AutomationRule {
    id: string;
    name: string;
    isActive: boolean;
    conditions: RuleCondition[];
    actions: RuleAction[];
}


// GL Tally Types
export interface GLSummary {
  description: string;
  recon_summary_value: number;
  gl_summary_value: number;
  difference: number;
}

export interface ManualAdjustment {
  id: string;
  adjustment_account: string;
  amount: number;
  justification: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  created_by: string;
  created_at: string;
}

// Reports & Generation Types
export interface ReportSummary {
  channel: string;
  report_type: 'Settlement Summary' | 'Exception Report';
  total_transactions: number;
  settled_value_bn: number;
  pending_transactions: number;
  pending_value_bn: number;
  report_date: string;
}

export interface GeneratedFileLog {
  id: string;
  file_name: string;
  file_type: 'TTUM' | 'NPCI Update';
  channel: string;
  generated_by: string;
  generated_at: string;
  status: 'Generated' | 'Uploaded';
}

export interface TransactionDetail {
  transaction_id: string;
  value_inr: number;
  status: 'Settled' | 'Pending' | 'Exception';
  transaction_date: string;
  description: string;
}

// Dispute Management Types
export type DisputeStatus = 'New' | 'Assigned' | 'Under Review' | 'Resolved';

export interface DisputeEvidence {
    id: string;
    fileName: string;
    fileType: string;
    uploadedBy: string;
    timestamp: string;
}

export interface DisputeComment {
    id: string;
    user: string;
    timestamp: string;
    comment: string;
}
export interface Dispute {
  dispute_id: string;
  channel: string;
  transaction_id: string;
  dispute_reason: string;
  raised_date: string;
  status: DisputeStatus;
  txn_amount: number;
  resolution_deadline: string;
  branch_id: string;
  assigned_to?: string;
  last_updated: string;
  evidence?: DisputeEvidence[];
  comments?: DisputeComment[];
}

export interface DisputeTimelineEvent {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details?: string;
}

// Admin Types
export interface FileFormatDefinition {
    id: string;
    name: string;
    channel: string;
    fileType: string;
    parserConfig: Record<string, any>;
}
export interface AuditLog {
  timestamp: string;
  user: string;
  channel: string;
  module: string;
  action: string;
  status: 'Success' | 'Failure';
}

export interface User {
  user_id: string;
  name: string;
  designation: string;
  assigned_channels: string[];
  role: 'Manager' | 'Analyst' | 'Admin' | 'Branch Officer';
  status: 'Active' | 'Inactive';
}

export interface SystemConfig {
  bank_id: string;
  environment: 'UAT' | 'PROD';
  supported_channels: string[];
  dummy_data_refresh_rate: string;
}

// Auditor Dashboard Types
export interface PermissionChange {
    id: string;
    user: string;
    action: string;
    timestamp: string;
    changed_by: string;
}

export interface DataIntegrityCheck {
    id: string;
    check_name: string;
    status: 'Passed' | 'Warning';
    last_run: string;
}