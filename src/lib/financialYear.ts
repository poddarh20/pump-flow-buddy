// Financial year utilities (April to March)

export function getCurrentFinancialYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // If Jan-Mar, FY started previous year
  const startYear = month < 3 ? year - 1 : year;
  return `${startYear}-${startYear + 1}`;
}

export function getFinancialYearRange(fy: string): { start: string; end: string } {
  const [startYear, endYear] = fy.split('-').map(Number);
  return {
    start: `${startYear}-04-01`,
    end: `${endYear}-03-31`,
  };
}

export function getFinancialYearOptions(count = 25): string[] {
  const now = new Date();
  const currentStartYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const options: string[] = [];
  for (let i = 0; i < count; i++) {
    const sy = currentStartYear - i;
    options.push(`${sy}-${sy + 1}`);
  }
  return options;
}

export function formatFinancialYear(fy: string): string {
  const [start, end] = fy.split('-');
  return `Apr ${start} – Mar ${end}`;
}
