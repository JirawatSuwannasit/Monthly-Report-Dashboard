'use client';

interface SelectDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  allLabel?: string;
}

export function SelectDropdown({ label, value, options, onChange, allLabel = 'All' }: SelectDropdownProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
