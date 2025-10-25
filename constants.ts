
import { DashboardIcon, FileUploadIcon, JobMonitorIcon, ReportsIcon, DisputeIcon, AuditLogIcon, UserIcon, AdminIcon, GLTallyIcon, ReconHubIcon } from './components/Icons';
import type { Page } from './types';

export const NAV_ITEMS: Page[] = [
  { id: 'dashboard', title: 'Command Center', icon: DashboardIcon },
  { id: 'ingestion-hub', title: 'File Ingestion Hub', icon: FileUploadIcon },
  { id: 'recon-hub', title: 'Reconciliation Hub', icon: ReconHubIcon },
  { id: 'gl-tally', title: 'GL Tally & Justification', icon: GLTallyIcon },
  { id: 'reports-generation', title: 'Reports & Generation', icon: ReportsIcon },
  { id: 'disputes', title: 'Dispute Management', icon: DisputeIcon },
  { id: 'audit-logs', title: 'Audit Logs', icon: AuditLogIcon },
  { id: 'user-management', title: 'User Management', icon: UserIcon },
  { id: 'system-admin', title: 'System Administration', icon: AdminIcon },
];
