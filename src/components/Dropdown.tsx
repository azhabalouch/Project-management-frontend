import { useState, useRef, useEffect, useCallback } from 'react';
import './style/Dropdown.css';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
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
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedValues = multiple
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : [];

  const selectedLabel = !multiple
    ? options.find(o => o.value === value)?.label ?? (typeof value === 'string' && value ? value : '')
    : '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = creatable && search.trim() && !options.some(
    o => o.value.toLowerCase() === search.trim().toLowerCase()
  ) && !selectedValues.includes(search.trim());

  const handleSelect = useCallback((optionValue: string) => {
    if (multiple) {
      const current = selectedValues;
      if (current.includes(optionValue)) {
        onChange(current.filter(v => v !== optionValue));
      } else {
        onChange([...current, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearch('');
    }
  }, [multiple, selectedValues, onChange]);

  const handleCreate = useCallback(() => {
    const newTag = search.trim();
    if (!newTag) return;
    if (multiple) {
      if (!selectedValues.includes(newTag)) {
        onChange([...selectedValues, newTag]);
      }
    } else {
      onChange(newTag);
      setIsOpen(false);
    }
    setSearch('');
  }, [search, multiple, selectedValues, onChange]);

  const handleRemove = useCallback((tagValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange(selectedValues.filter(v => v !== tagValue));
    }
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

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange([]);
    } else {
      onChange('');
    }
  };

  const hasValue = multiple ? selectedValues.length > 0 : !!value;

  return (
    <div
      ref={containerRef}
      className={`dropdown ${isOpen ? 'dropdown--open' : ''} ${disabled ? 'dropdown--disabled' : ''} ${multiple ? 'dropdown--multi' : ''}`}
      id={id}
    >
      <div className='dropdown-trigger' onClick={handleToggle} role='combobox' aria-expanded={isOpen}>
        {multiple ? (
          <div className='dropdown-multi-values'>
            {selectedValues.length === 0 && !search && (
              <span className='dropdown-placeholder'>{placeholder}</span>
            )}
            {selectedValues.map(v => (
              <span key={v} className='dropdown-chip'>
                {v}
                <button type='button' className='dropdown-chip-remove' onClick={(e) => handleRemove(v, e)}>&times;</button>
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
        <div className='dropdown-trigger-actions'>
          {hasValue && !disabled && (
            <button type='button' className='dropdown-clear' onClick={handleClear}>&times;</button>
          )}
          <span className='dropdown-chevron'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <path d='M4 6L8 10L12 6' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
            </svg>
          </span>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className='dropdown-menu'>
          {filteredOptions.length === 0 && !canCreate && (
            <div className='dropdown-empty'>No options found</div>
          )}
          {filteredOptions.map(option => {
            const isSelected = multiple
              ? selectedValues.includes(option.value)
              : value === option.value;
            return (
              <div
                key={option.value}
                className={`dropdown-option ${isSelected ? 'dropdown-option--selected' : ''}`}
                onClick={() => handleSelect(option.value)}
                role='option'
                aria-selected={isSelected}
              >
                {multiple && (
                  <span className={`dropdown-checkbox ${isSelected ? 'dropdown-checkbox--checked' : ''}`}>
                    {isSelected && (
                      <svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
                        <path d='M10 3L4.5 8.5L2 6' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                      </svg>
                    )}
                  </span>
                )}
                <span className='dropdown-option-label'>{option.label}</span>
                {!multiple && isSelected && (
                  <span className='dropdown-option-check'>
                    <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
                      <path d='M11.6666 3.5L5.24992 9.91667L2.33325 7' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                    </svg>
                  </span>
                )}
              </div>
            );
          })}
          {canCreate && (
            <div className='dropdown-option dropdown-option--create' onClick={handleCreate}>
              <span className='dropdown-create-icon'>+</span>
              <span>Create <strong>&ldquo;{search.trim()}&rdquo;</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
