import { describe, it, expect } from 'vitest';
import { sanitizeForExport } from '../lib/export';

describe('sanitizeForExport', () => {
  it('should prepend a single quote to strings starting with =', () => {
    expect(sanitizeForExport('=1+1')).toBe("'=1+1");
  });

  it('should prepend a single quote to strings starting with +', () => {
    expect(sanitizeForExport('+SUM(A1:A2)')).toBe("'+SUM(A1:A2)");
  });

  it('should prepend a single quote to strings starting with -', () => {
    expect(sanitizeForExport('-some-data')).toBe("'-some-data");
  });

  it('should prepend a single quote to strings starting with @', () => {
    expect(sanitizeForExport('@membro')).toBe("'@membro");
  });

  it('should prepend a single quote to strings starting with tab', () => {
    expect(sanitizeForExport('\tsome-tab-data')).toBe("'\tsome-tab-data");
  });

  it('should prepend a single quote to strings starting with carriage return', () => {
    expect(sanitizeForExport('\rsome-cr-data')).toBe("'\rsome-cr-data");
  });

  it('should NOT prepend a single quote to normal strings', () => {
    expect(sanitizeForExport('Normal Member Name')).toBe('Normal Member Name');
    expect(sanitizeForExport('member@example.com')).toBe('member@example.com');
  });

  it('should NOT modify numbers', () => {
    expect(sanitizeForExport(123)).toBe(123);
    expect(sanitizeForExport(0)).toBe(0);
    expect(sanitizeForExport(-123)).toBe(-123); // Number -123 is not a string starting with -
  });

  it('should handle empty strings', () => {
    expect(sanitizeForExport('')).toBe('');
  });

  it('should handle null or undefined', () => {
    expect(sanitizeForExport(null)).toBe(null);
    expect(sanitizeForExport(undefined)).toBe(undefined);
  });
});
