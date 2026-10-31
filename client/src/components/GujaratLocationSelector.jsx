import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Building2, Sparkles } from 'lucide-react';
import { GUJARAT_CITIES, filterGujaratLocations } from '../data/gujaratLocations';

/**
 * GujaratLocationSelector
 * Fast search and selection across Gujarat cities, streets, areas, and food landmarks.
 *
 * @param {Object} props
 * @param {string} props.selectedCity - Current city name
 * @param {string} props.selectedArea - Current area name
 * @param {function} props.onSelect - Callback ({ city, area, coordinates, pincode })
 * @param {string} [props.placeholder] - Custom placeholder
 */
export default function GujaratLocationSelector({
  selectedCity = '',
  selectedArea = '',
  onSelect,
  placeholder = 'Search area, street, or landmark in Gujarat...'
}) {
  const [city, setCity] = useState(selectedCity || 'All Gujarat');
  const [areaInput, setAreaInput] = useState(selectedArea || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setAreaInput(selectedArea || '');
  }, [selectedArea]);

  useEffect(() => {
    setCity(selectedCity || 'All Gujarat');
  }, [selectedCity]);

  // Compute suggestions when typing or changing city
  useEffect(() => {
    const list = filterGujaratLocations(areaInput, city === 'All Gujarat' ? '' : city, 8);
    setSuggestions(list);
  }, [areaInput, city]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCity(newCity);
    if (onSelect) {
      onSelect({
        city: newCity === 'All Gujarat' ? '' : newCity,
        area: '',
        coordinates: null
      });
    }
  };

  const handleSelectArea = (item) => {
    setAreaInput(item.name);
    setCity(item.city);
    setIsOpen(false);
    if (onSelect) {
      onSelect({
        city: item.city,
        area: item.name,
        coordinates: item.coordinates,
        pincode: item.pincode,
        type: item.type
      });
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* City Dropdown */}
        <div className="relative sm:w-48 shrink-0">
          <div className="absolute left-3 top-3 pointer-events-none text-[#16803D]">
            <Building2 className="h-4 w-4" />
          </div>
          <select
            value={city}
            onChange={handleCityChange}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#E5EAE5] bg-white text-xs sm:text-sm font-semibold text-[#17231D] focus:outline-none focus:border-[#16803D] focus:ring-1 focus:ring-[#16803D] cursor-pointer appearance-none"
          >
            {GUJARAT_CITIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} {c.gujarati ? `(${c.gujarati})` : ''}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3 pointer-events-none text-[#647067]">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* Area / Landmark Autocomplete Input */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-3 pointer-events-none text-[#647067]">
            <MapPin className="h-4 w-4 text-[#16803D]" />
          </div>
          <input
            type="text"
            value={areaInput}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setAreaInput(e.target.value);
              setIsOpen(true);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#E5EAE5] bg-white text-xs sm:text-sm text-[#17231D] placeholder:text-[#647067] focus:outline-none focus:border-[#16803D] focus:ring-1 focus:ring-[#16803D]"
          />
          {areaInput && (
            <button
              type="button"
              onClick={() => {
                setAreaInput('');
                if (onSelect) {
                  onSelect({ city: city === 'All Gujarat' ? '' : city, area: '', coordinates: null });
                }
              }}
              className="absolute right-3 top-3 text-[#647067] hover:text-[#17231D] text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl border border-[#E5EAE5] shadow-lg max-h-72 overflow-y-auto divide-y divide-[#E5EAE5]">
          <div className="px-3 py-1.5 bg-[#FAFAF5] text-[10px] font-bold text-[#647067] uppercase tracking-wider flex items-center justify-between">
            <span>Gujarat Areas & Famous Landmarks</span>
            <span className="text-[#16803D] flex items-center">
              <Sparkles className="h-3 w-3 mr-1" /> Quick Pick
            </span>
          </div>

          {suggestions.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              type="button"
              onClick={() => handleSelectArea(item)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-[#EDF7EF] transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#17231D] group-hover:text-[#16803D]">
                    {item.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      item.type === 'landmark'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#FAFAF5] text-[#647067]'
                    }`}
                  >
                    {item.type === 'landmark' ? 'Khau Galli / Landmark' : item.city}
                  </span>
                </div>
                {item.description && (
                  <p className="text-[11px] text-[#647067] line-clamp-1">{item.description}</p>
                )}
              </div>
              <span className="text-[11px] text-[#16803D] opacity-0 group-hover:opacity-100 font-semibold flex items-center shrink-0 ml-2">
                Select →
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
