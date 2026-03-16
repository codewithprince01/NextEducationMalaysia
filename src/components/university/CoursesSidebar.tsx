'use client'

import React, { useState, useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'

interface CoursesSidebarProps {
  filterOptions: {
    [key: string]: Array<{ id: string | number; name: string }>
  }
  selectedFilters: { [key: string]: any[] }
  onFiltersChange: (filters: { [key: string]: any[] }) => void
  onClearAll: () => void
}

const CoursesSidebar: React.FC<CoursesSidebarProps> = ({
  filterOptions,
  selectedFilters,
  onFiltersChange,
  onClearAll,
}) => {
  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem('openFilters_courses2')
      if (saved) return JSON.parse(saved)
    } catch {}
    return Object.keys(filterOptions).reduce((acc: any, key) => {
      acc[key] = true
      return acc
    }, {})
  })

  useEffect(() => {
    localStorage.setItem('openFilters_courses2', JSON.stringify(openFilters))
  }, [openFilters])

  useEffect(() => {
    setOpenFilters((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(filterOptions)) {
        if (!(key in next)) next[key] = true
      }
      return next
    })
  }, [filterOptions])

  const toggleFilter = (key: string) =>
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleCheckboxChange = (category: string, value: string | number) => {
    const current = selectedFilters[category]?.[0]
    const newValues = current === value ? [] : [value]
    onFiltersChange?.({ ...selectedFilters, [category]: newValues })
  }

  return (
    <div className="w-full lg:w-64 bg-white p-4 rounded-xl shadow-md space-y-6 text-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
        <button
          className="text-blue-600 text-sm hover:underline cursor-pointer"
          onClick={onClearAll}
        >
          Reset
        </button>
      </div>

      {Object.entries(filterOptions).map(([title, options]) => (
        <div key={title} className="space-y-2">
          <div
            className="flex justify-between items-center cursor-pointer text-gray-800 font-semibold text-base"
            onClick={() => toggleFilter(title)}
          >
            <span>{title}</span>
            <FiChevronDown
              className={`text-xl transform transition-transform duration-300 ${openFilters[title] ? 'rotate-180' : ''}`}
            />
          </div>

          {openFilters[title] && (
            <div className="mt-2 pl-1 space-y-2 max-h-48 overflow-y-auto">
              {options.length > 0 ? (
                options.map((label, i) => (
                  <label
                    key={`${title}-${label.id}-${i}`}
                    className="flex items-center gap-2 text-[15px] text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-600"
                      checked={selectedFilters[title]?.[0] === label.id}
                      onChange={() => handleCheckboxChange(title, label.id)}
                    />
                    <span>{label.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No options available</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default CoursesSidebar
