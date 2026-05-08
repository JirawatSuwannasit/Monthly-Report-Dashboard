'use client';

import { useFilters } from '@/context/FilterContext';
import { SelectDropdown } from './SelectDropdown';

export function FilterBar() {
  const {
    fy1, setFY1,
    fy2, setFY2,
    month, setMonth,
    fyOptions, monthOptions,
  } = useFilters();

  return (
    <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-blue-700 rounded-full" />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Global Filters
            </span>
          </div>

          <SelectDropdown
            label="Fiscal Year 1 (FY1)"
            value={fy1}
            options={fyOptions}
            onChange={setFY1}
            allLabel="Select FY1"
          />
          <SelectDropdown
            label="Fiscal Year 2 (FY2)"
            value={fy2}
            options={fyOptions}
            onChange={setFY2}
            allLabel="Select FY2"
          />
          <SelectDropdown
            label="Month"
            value={month}
            options={monthOptions}
            onChange={setMonth}
            allLabel="All Months"
          />
        </div>
      </div>
    </div>
  );
}
