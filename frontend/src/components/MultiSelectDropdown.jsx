import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check, Filter } from 'lucide-react';

export default function MultiSelectDropdown({
  label,
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'Arayın...',
  allLabel = 'Tümü'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on internal search input
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = selectedValues.length === 0 || selectedValues.includes(allLabel);

  const handleToggleOption = (option) => {
    if (option === allLabel) {
      onChange([]);
      return;
    }

    let newSelected;
    if (selectedValues.includes(option)) {
      newSelected = selectedValues.filter(item => item !== option && item !== allLabel);
    } else {
      newSelected = [...selectedValues.filter(item => item !== allLabel), option];
    }
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    onChange([]);
    setSearchTerm('');
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Label text generation
  let triggerText = allLabel;
  if (!isAllSelected && selectedValues.length > 0) {
    if (selectedValues.length === 1) {
      triggerText = selectedValues[0];
    } else {
      triggerText = `${selectedValues[0]} (+${selectedValues.length - 1})`;
    }
  }

  return (
    <div className="relative w-full text-xs font-semibold" ref={dropdownRef}>
      {/* Label above */}
      <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
        <span>{label}</span>
        {selectedValues.length > 0 && !isAllSelected && (
          <span className="text-[10px] text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
            {selectedValues.length} Seçili
          </span>
        )}
      </label>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-50 border rounded-xl px-3 py-2.5 transition-all duration-150 ${
          isOpen
            ? 'border-blue-600 bg-white ring-2 ring-blue-500/10 shadow-sm'
            : !isAllSelected && selectedValues.length > 0
            ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
            : 'border-slate-200 text-slate-800 hover:bg-slate-100/80'
        }`}
      >
        <span className="truncate pr-2">{triggerText}</span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {!isAllSelected && selectedValues.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
              title="Temizle"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </div>
      </button>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Internal Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-1 text-[11px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Tümünü Seç
            </button>
            {!isAllSelected && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-400 hover:text-rose-600 font-semibold"
              >
                Temizle
              </button>
            )}
          </div>

          {/* Scrollable Option Items */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
            {/* Tümü (All) option */}
            <div
              onClick={() => handleToggleOption(allLabel)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isAllSelected
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'hover:bg-slate-100 text-slate-700 font-medium'
              }`}
            >
              <span>{allLabel} (Tüm Seçenekler)</span>
              {isAllSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </div>

            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-[11px]">
                Sonuç bulunamadı.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => handleToggleOption(opt)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by div click
                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 pointer-events-none"
                      />
                      <span className="truncate">{opt}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
