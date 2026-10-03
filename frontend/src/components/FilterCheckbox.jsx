import React from 'react';
import { Check } from 'lucide-react';

export default function FilterCheckbox({ label, isChecked, onChange }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-4 text-left focus:outline-none group"
    >
      <div
        className={`w-[12px] h-[12px] rounded-[2px] flex items-center justify-center transition-all ${
          isChecked ? 'bg-black border-black' : 'border border-gray-400 bg-white group-hover:border-black'
        }`}
      >
        {isChecked && <Check size={8} strokeWidth={4} className="text-white" />}
      </div>
      <span style={{ color: "#333", fontFamily: "Gotham Book, sans-serif", fontSize: "11px", fontStyle: "normal", fontWeight: 400, letterSpacing: "0.8px", textTransform: "uppercase" }}>
        {label}
      </span>
    </button>
  );
}
