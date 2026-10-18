import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount into Ghana Cedi (GH₵)
 */
export function formatGHS(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('GHS', 'GH₵');
}

/**
 * Validate and clean a Ghanaian phone number.
 */
export function isValidGhanaPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const ghanaRegex = /^(?:(?:\+?233)|0)(2[0-9]|5[0-9])[0-9]{7}$/;
  return ghanaRegex.test(cleaned);
}

/**
 * Format phone into standard 10-digit Ghana local format (e.g. 024 412 3456)
 */
export function formatGhanaPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+233')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('233')) {
    cleaned = '0' + cleaned.slice(3);
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Determine telecom network from Ghanaian phone prefix
 */
export function detectGhanaNetwork(phone: string): 'MTN' | 'Telecel' | 'AirtelTigo' | 'Unknown' {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  let local = cleaned;
  if (local.startsWith('+233')) local = '0' + local.slice(4);
  else if (local.startsWith('233')) local = '0' + local.slice(3);

  const prefix = local.slice(0, 3);
  if (['024', '054', '055', '059', '025'].includes(prefix)) return 'MTN';
  if (['020', '050'].includes(prefix)) return 'Telecel';
  if (['027', '057', '026', '056'].includes(prefix)) return 'AirtelTigo';

  return 'Unknown';
}

/**
 * Generate a unique, readable Order Number for Jaytel Classic Store (e.g. JTC-2026-89412)
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `JTC-${year}-${randomPart}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}
