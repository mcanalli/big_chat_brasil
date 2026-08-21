import { describe, it, expect } from 'vitest';

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 || cleaned.length === 13) {
    return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 4)}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
  }
  return phone;
}

export function formatDateRelative(dateSource: string | Date): string {
  if (!dateSource) return '';
  const date = new Date(dateSource);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function validateDocument(doc: string, type: 'CPF' | 'CNPJ'): boolean {
  if (!doc) return false;
  const cleaned = doc.replace(/\D/g, '');
  if (type === 'CPF') return cleaned.length === 11;
  if (type === 'CNPJ') return cleaned.length === 14;
  return false;
}

describe('Frontend Helpers & Validators', () => {
  it('should format phone numbers correctly', () => {
    expect(formatPhone('5511999999999')).toBe('+55 (11) 99999-9999');
    expect(formatPhone('')).toBe('');
    expect(formatPhone('123')).toBe('123');
  });

  it('should format relative dates correctly', () => {
    const now = new Date();
    expect(formatDateRelative(now)).toBe('Hoje');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDateRelative(yesterday)).toBe('Ontem');

    const oldDate = new Date(2020, 0, 1);
    const day = String(oldDate.getDate()).padStart(2, '0');
    const month = String(oldDate.getMonth() + 1).padStart(2, '0');
    const year = oldDate.getFullYear();
    expect(formatDateRelative(oldDate)).toBe(`${day}/${month}/${year}`);
    expect(formatDateRelative('')).toBe('');
  });

  it('should validate documents correctly', () => {
    expect(validateDocument('12345678909', 'CPF')).toBe(true);
    expect(validateDocument('12345', 'CPF')).toBe(false);
    expect(validateDocument('12345678000199', 'CNPJ')).toBe(true);
    expect(validateDocument('12345', 'CNPJ')).toBe(false);
    expect(validateDocument('', 'CPF')).toBe(false);
  });
});

