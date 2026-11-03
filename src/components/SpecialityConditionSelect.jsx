import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SpecialityConditionSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const listboxId = useId();
  const selectedIndex = Math.max(options.indexOf(value), 0);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !listboxRef.current) return;
    const selectedOption = listboxRef.current.querySelector('[aria-selected="true"]');
    selectedOption?.scrollIntoView({ block: 'nearest' });
  }, [isOpen]);

  const handleListboxKeyDown = (event) => {
    const optionElements = listboxRef.current?.querySelectorAll('[role="option"]');
    if (!optionElements?.length) return;

    const currentIndex = Array.from(optionElements).indexOf(document.activeElement);
    let nextIndex = currentIndex < 0 ? selectedIndex : currentIndex;

    if (event.key === 'ArrowDown') {
      nextIndex = Math.min(nextIndex + 1, optionElements.length - 1);
    } else if (event.key === 'ArrowUp') {
      nextIndex = Math.max(nextIndex - 1, 0);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      return;
    } else {
      return;
    }

    event.preventDefault();
    optionElements[nextIndex].focus();
    optionElements[nextIndex].scrollIntoView({ block: 'nearest' });
  };

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-30' : ''}`}>
      <button
        type="button"
        aria-label="Select Speciality / Condition"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !isOpen) {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer flex items-center justify-between gap-2"
      >
        <span className="truncate">{value || 'Select a speciality / condition'}</span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          aria-label="Speciality / Condition options"
          onKeyDown={handleListboxKeyDown}
          className="absolute top-full left-0 right-0 z-[70] mt-1 max-h-48 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9' }}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              tabIndex={value === option ? 0 : -1}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-xs transition-colors focus:outline-none focus:bg-blue-50 ${
                value === option
                  ? 'bg-blue-50 font-semibold text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
