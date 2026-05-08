## 2025-05-14 - CSV Injection in Data Exports
**Vulnerability:** CSV/Formula Injection in export functions.
**Learning:** User-controlled data (names, emails) was directly included in CSV/XLSX exports without sanitization. Spreadsheet software can execute strings starting with =, +, -, or @ as formulas.
**Prevention:** Always sanitize strings for export by prepending a single quote (') to those starting with trigger characters (=, +, -, @, \t, \r).
