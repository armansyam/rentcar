'use client';

import React from 'react';

interface RupiahInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RupiahInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  required = false,
  id,
  size = 'md',
}: RupiahInputProps) {
  // When value is 0, display empty string so user doesn't get annoying leading 0 or jumpy edits
  const displayValue = value ? value.toLocaleString('id-ID') : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only numbers
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = rawVal === '' ? 0 : parseInt(rawVal, 10);
    onChange(num);
  };

  const paddingClass = size === 'sm' ? 'pl-8 pr-2.5 py-1.5 text-xs' : 'pl-9 pr-3.5 py-2.5 text-xs sm:text-sm';
  const prefixPadding = size === 'sm' ? 'left-2.5 text-[11px]' : 'left-3.5 text-xs';

  return (
    <div className="relative flex items-center w-full">
      <span className={`absolute ${prefixPadding} font-black text-slate-400 select-none pointer-events-none`}>
        Rp
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all ${paddingClass} ${className}`}
      />
    </div>
  );
}
