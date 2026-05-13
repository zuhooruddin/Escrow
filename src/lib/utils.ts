import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── MONEY ────────────────────────────────────────────────────────────────────
export function formatPKR(paisa: number): string {
  const pkr = paisa / 100;
  return `Rs. ${pkr.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

export function paisaToFloat(paisa: number): number {
  return paisa / 100;
}

export function floatToPaisa(pkr: number): number {
  return Math.round(pkr * 100);
}

// ─── DATE ─────────────────────────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy');
}

export function formatDateFull(date: string | Date): string {
  return format(new Date(date), 'MMMM d, yyyy h:mm a');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysRemaining(date: string | Date): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function hoursRemaining(date: string | Date): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
}

// ─── DEAL STATUS ──────────────────────────────────────────────────────────────
export type DealStatus = 'PENDING' | 'FUNDED' | 'DELIVERED' | 'COMPLETED' | 'DISPUTED' | 'REFUNDED' | 'CANCELLED';

export const STATUS_CONFIG: Record<DealStatus, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:   { label: 'Pending',   color: 'text-amber-700',   bg: 'bg-amber-50  border-amber-200',  dot: 'bg-amber-500' },
  FUNDED:    { label: 'Funded',    color: 'text-blue-700',    bg: 'bg-blue-50   border-blue-200',   dot: 'bg-blue-500' },
  DELIVERED: { label: 'Delivered', color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
  COMPLETED: { label: 'Completed', color: 'text-green-700',   bg: 'bg-green-50  border-green-200',  dot: 'bg-upwork-green' },
  DISPUTED:  { label: 'Disputed',  color: 'text-red-700',     bg: 'bg-red-50    border-red-200',    dot: 'bg-red-500' },
  REFUNDED:  { label: 'Refunded',  color: 'text-gray-600',    bg: 'bg-gray-100  border-gray-200',   dot: 'bg-gray-400' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-500',    bg: 'bg-gray-100  border-gray-200',   dot: 'bg-gray-300' },
};

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as DealStatus] || STATUS_CONFIG.CANCELLED;
}

// ─── STRINGS ──────────────────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── ERRORS ───────────────────────────────────────────────────────────────────
/** User-facing message from axios/API errors, `Error`, or unknown throws. */
export function getErrorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
  const fromApi = anyErr?.response?.data?.message;
  if (typeof fromApi === 'string' && fromApi.trim()) return fromApi;
  if (typeof anyErr?.message === 'string' && anyErr.message.trim()) return anyErr.message;
  return 'Something went wrong. Please try again.';
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────
export function isValidPakistaniPhone(phone: string): boolean {
  return /^(\+92|92|0)?3[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

export function isValidCNIC(cnic: string): boolean {
  return /^\d{5}-\d{7}-\d{1}$/.test(cnic);
}

// ─── CATEGORY LABELS ──────────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  freelance:        'Freelance Services',
  domain_website:   'Domain & Website',
  physical_goods:   'Physical Goods',
  digital_products: 'Digital Products',
  other:            'Other',
};
