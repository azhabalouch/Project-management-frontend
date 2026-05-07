import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, CheckIcon, CloseIcon } from '../components/Icons';

// --- Types ---
export interface DropdownOption {
  value: string;
  label: string;
}

// Array of options to display in the dropdown
export interface DropdownProps {
  options: DropdownOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  creatable?: boolean;
  id?: string;
  disabled?: boolean;
}

/**
 * Dropdown Component
 * 
 * A highly versatile custom select component supporting single/multi-selection,
 * searching, and dynamic option creation. Utilizes shared Lucide icons.
 */
export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  searchable = true,
  creatable = false,
  id,
  disabled = false,
}: DropdownProps) {
  // --- State & Refs ---
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Derived State ---
  const selectedValues = multiple ? (Array.isArray(value) ? value : value ? [value] : []) : [];
  const selectedLabel = !multiple ? options.find(o => o.value === value)?.label ?? (typeof value === 'string' && value ? value : '') : '';
  const hasValue = multiple ? selectedValues.length > 0 : !!value;
  
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const trimmedSearch = search.trim();
  const canCreate = creatable && trimmedSearch && !options.some(o => o.value.toLowerCase() === trimmedSearch.toLowerCase()) && !selectedValues.includes(trimmedSearch);

  // --- Effects ---

  // Handle clicking outside the component to close it
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // --- Event Handlers ---

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const handleSelect = useCallback((optionValue: string) => {
    if (multiple) {
      const isCurrentlySelected = selectedValues.includes(optionValue);
      onChange(isCurrentlySelected ? selectedValues.filter(v => v !== optionValue) : [...selectedValues, optionValue]);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearch('');
    }
  }, [multiple, selectedValues, onChange]);

  const handleCreate = useCallback(() => {
    if (!trimmedSearch) return;
    
    if (multiple) {
      if (!selectedValues.includes(trimmedSearch)) {
        onChange([...selectedValues, trimmedSearch]);
      }
    } else {
      onChange(trimmedSearch);
      setIsOpen(false);
    }
    setSearch('');
  }, [trimmedSearch, multiple, selectedValues, onChange]);

  const handleRemoveChip = useCallback((tagValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) onChange(selectedValues.filter(v => v !== tagValue));
  }, [multiple, selectedValues, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'Enter' && canCreate) {
      e.preventDefault();
      handleCreate();
    }
  }, [canCreate, handleCreate]);

  // --- Render ---
  return (
    <div
      ref={containerRef}
      id={id}
      className={`dropdown ${isOpen ? 'dropdown--open' : ''} ${disabled ? 'dropdown--disabled' : ''} ${multiple ? 'dropdown--multi' : ''}`}
    >
      {/* Trigger / Input Area */}
      <div className='dropdown-trigger' onClick={handleToggle} role='combobox' aria-expanded={isOpen}>
        
        {multiple ? (
          <div className='dropdown-multi-values'>
            {selectedValues.length === 0 && !search && (
              <span className='dropdown-placeholder'>{placeholder}</span>
            )}
            {selectedValues.map(v => (
              <span key={v} className='dropdown-chip'>
                {v}
                <button type='button' className='dropdown-chip-remove flex items-center justify-center' onClick={(e) => handleRemoveChip(v, e)} aria-label={`Remove ${v}`}>
                  <CloseIcon size={12} />
                </button>
              </span>
            ))}
            {isOpen && searchable && (
              <input
                ref={inputRef}
                className='dropdown-search-input'
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedValues.length === 0 ? placeholder : ''}
                onClick={e => e.stopPropagation()}
              />
            )}
          </div>
        ) : (
          <>
            {isOpen && searchable ? (
              <input
                ref={inputRef}
                className='dropdown-search-input'
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Search...'
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className={selectedLabel ? 'dropdown-selected-label' : 'dropdown-placeholder'}>
                {selectedLabel || placeholder}
              </span>
            )}
          </>
        )}

        {/* Trigger Actions (Clear & Chevron) */}
        <div className='dropdown-trigger-actions'>
          {hasValue && !disabled && (
            <button type='button' className='dropdown-clear flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors' onClick={handleClear} aria-label="Clear selection">
              <CloseIcon size={14} />
            </button>
          )}
          <span className='dropdown-chevron flex items-center justify-center'>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </div>

      {/* Menu / Dropdown List */}
      {isOpen && !disabled && (
        <div className='dropdown-menu' role="listbox">
          {filteredOptions.length === 0 && !canCreate && (
            <div className='dropdown-empty'>No options found</div>
          )}
          
          {filteredOptions.map(option => {
            const isSelected = multiple ? selectedValues.includes(option.value) : value === option.value;
            
            return (
              <div
                key={option.value}
                className={`dropdown-option ${isSelected ? 'dropdown-option--selected' : ''}`}
                onClick={() => handleSelect(option.value)}
                role='option'
                aria-selected={isSelected}
              >
                {multiple && (
                  <span className={`dropdown-checkbox ${isSelected ? 'dropdown-checkbox--checked' : ''} flex items-center justify-center`}>
                    {isSelected && <CheckIcon size={12} strokeWidth={3} className="text-white" />}
                  </span>
                )}
                
                <span className='dropdown-option-label'>{option.label}</span>
                
                {!multiple && isSelected && (
                  <span className='dropdown-option-check flex items-center justify-center'>
                    <CheckIcon size={14} />
                  </span>
                )}
              </div>
            );
          })}

          {/* Create New Option */}
          {canCreate && (
            <div className='dropdown-option dropdown-option--create' onClick={handleCreate}>
              <span className='dropdown-create-icon'>+</span>
              <span>Create <strong>&ldquo;{trimmedSearch}&rdquo;</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}