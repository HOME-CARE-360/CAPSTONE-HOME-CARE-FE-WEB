'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutocompleteSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  options: Array<{ id: number; name: string; parentCategory?: { name: string } | null }>;
  placeholder?: string;
}

export function AutocompleteSelect({
  value,
  onChange,
  options,
  placeholder,
}: AutocompleteSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ id: number; name: string }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize selected items from value prop
  useEffect(() => {
    if (value && value.length > 0) {
      const items = value
        .map(id => {
          const option = options.find(opt => opt.id === id);
          return option ? { id: option.id, name: option.name } : null;
        })
        .filter(Boolean) as Array<{ id: number; name: string }>;
      setSelectedItems(items);
    } else {
      setSelectedItems([]);
    }
  }, [value, options]);

  // Filter options based on search term
  const filteredOptions = options.filter(
    option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedItems.some(item => item.id === option.id)
  );

  // Handle option selection
  const handleSelect = (option: { id: number; name: string }) => {
    const newSelectedItems = [...selectedItems, option];
    setSelectedItems(newSelectedItems);
    // Ensure we're passing numbers, not strings
    const newValues = newSelectedItems.map(item => Number(item.id));
    onChange(newValues);
    setSearchTerm('');
    setIsOpen(false);
  };

  // Handle removing selected item
  const handleRemove = (id: number) => {
    const newSelectedItems = selectedItems.filter(item => item.id !== id);
    setSelectedItems(newSelectedItems);
    // Ensure we're passing numbers, not strings
    const newValues = newSelectedItems.map(item => Number(item.id));
    onChange(newValues);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="min-h-[40px] border border-input bg-background rounded-md px-3 py-2">
        {/* Selected items */}
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedItems.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm"
            >
              <span>{item.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="hover:bg-primary/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Search input */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedItems.length === 0 ? placeholder : 'Search categories...'}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-2 p-1 hover:bg-accent rounded-sm"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No categories found</div>
          ) : (
            <div>
              {filteredOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2 text-left hover:bg-accent text-sm flex flex-col"
                >
                  <span className="font-medium">{option.name}</span>
                  {option.parentCategory && (
                    <span className="text-xs text-muted-foreground">
                      {option.parentCategory.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
