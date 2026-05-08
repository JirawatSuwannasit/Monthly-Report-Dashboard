'use client';

import { useFilters } from '@/context/FilterContext';
import { SelectDropdown } from './SelectDropdown';
import { MultiSelect } from './MultiSelect';

export function FilterBar() {
  const {
    fy, setFY,
    month, setMonth,
    selectedMCs, setSelectedMCs,
    selectedMachines, setSelectedMachines,
    compareFY1, setCompareFY1,
    compareFY2, setCompareFY2,
    fyOptions, monthOptions, mcOptions, machineOptions,
  } = useFilters();

  return (
    <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 mr-2">
            <div className="w-1 h-8 bg-blue-700 rounded-full" />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Global Filters</span>
          </div>

          <SelectDropdown label="Fiscal Year" value={fy} options={fyOptions} onChange={setFY} />
          <SelectDropdown label="Month" value={month} options={monthOptions} onChange={setMonth} />
          <MultiSelect
            label="Machine Category"
            options={mcOptions}
            selected={selectedMCs}
            onChange={setSelectedMCs}
            placeholder="All Categories"
          />
          <MultiSelect
            label="Machine Name"
            options={machineOptions}
            selected={selectedMachines}
            onChange={setSelectedMachines}
            placeholder="All Machines"
          />

          <div className="ml-auto flex flex-wrap items-end gap-4 border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide self-end pb-2">Compare FY</span>
            <SelectDropdown label="FY 1 (Bars)" value={compareFY1} options={fyOptions} onChange={setCompareFY1} allLabel="Select FY1" />
            <SelectDropdown label="FY 2 (Bars + Line)" value={compareFY2} options={fyOptions} onChange={setCompareFY2} allLabel="Select FY2" />
          </div>
        </div>
      </div>
    </div>
  );
}
