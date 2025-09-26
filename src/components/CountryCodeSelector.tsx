import React, { useState } from 'react';
import { COUNTRIES } from '../constants/countries';
import { tv } from '../utils/helpers';

interface CountryCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  disabled?: boolean;
}

export function CountryCodeSelector({ value, onChange, isDark, disabled }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => c.code === value) || COUNTRIES[0]
  );

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm) ||
    country.flag.includes(searchTerm)
  );

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    onChange(country.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-32 sm:w-40">
      {/* Botón del selector */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full rounded-xl border-2 px-3 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 flex items-center justify-between ${tv(
          isDark,
          'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200 hover:border-blue-300',
          'border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20 hover:border-blue-400'
        )} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium">{selectedCountry.code}</span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border-2 shadow-lg z-50 max-h-64 overflow-hidden ${tv(
          isDark,
          'border-gray-200 bg-white',
          'border-gray-600 bg-gray-800'
        )}`}>
          {/* Barra de búsqueda */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              placeholder="Buscar país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border ${tv(
                isDark,
                'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200',
                'border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-800/20'
              )}`}
              autoFocus
            />
          </div>

          {/* Lista de países */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code + country.name}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-3 ${tv(
                    isDark,
                    'text-gray-900 hover:text-blue-700',
                    'text-white hover:text-blue-300'
                  )} ${selectedCountry.code === country.code ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{country.name}</div>
                    <div className="text-xs opacity-70">{country.code}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className={`px-3 py-2 text-sm ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
                No se encontraron países
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar al hacer clic fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}