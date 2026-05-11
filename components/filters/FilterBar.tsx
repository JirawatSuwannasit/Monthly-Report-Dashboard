'use client';

import { useFilters } from '@/context/FilterContext';
import { SelectDropdown } from './SelectDropdown';

export function FilterBar() {
  const {
    fy1, setFY1,
    fy2, setFY2,
    month, setMonth,
    fyOptions, monthOptions,
    printMode, setPrintMode,
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

          {/* Print mode toggle: switches bar charts to colored texture fills */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Print Mode
            </span>
            <button
              onClick={() => setPrintMode(!printMode)}
              aria-pressed={printMode}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                printMode
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              {printMode ? 'Texture ON' : 'Texture OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
