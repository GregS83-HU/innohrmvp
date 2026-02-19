'use client'

import { useEffect, useState, useRef } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface CompanyUser {
  user_id: string
  first_name: string
  last_name: string
  email: string
  is_admin: boolean
  is_super_admin: boolean
  is_manager: boolean
  manager_id: string | null
  manager_first_name: string | null
  manager_last_name: string | null
  employment_start_date: string | null
}

interface TranslationFunction {
  (key: string): string
}

interface ManagerDropdownProps {
  selectedManager: CompanyUser | null
  onSelect: (manager: CompanyUser | null) => void
  companyId: string
  t: TranslationFunction
}

export function ManagerDropdown({ selectedManager, onSelect, companyId, t }: ManagerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [managers, setManagers] = useState<CompanyUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .rpc('get_company_users', { company_id_input: companyId })
        if (error) {
          setError(t('managerDropdown.errorLoading'))
          setManagers([])
          return
        }
        if (!data || data.length === 0) {
          setError(t('managerDropdown.noUsers'))
          setManagers([])
          return
        }
        setManagers(data)
      } catch {
        setError(t('managerDropdown.errorLoading'))
        setManagers([])
      } finally {
        setLoading(false)
      }
    }
    if (companyId) fetchManagers()
  }, [companyId, t])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredManagers = managers.filter(manager =>
    `${manager.first_name} ${manager.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (manager: CompanyUser) => {
    onSelect(manager)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between bg-white"
      >
        <span className={selectedManager ? 'text-gray-900' : 'text-gray-400'}>
          {selectedManager
            ? `${selectedManager.first_name} ${selectedManager.last_name}`
            : t('managerDropdown.selectManager')}
        </span>
        <div className="flex items-center gap-2">
          {selectedManager && (
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" onClick={handleClear} />
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('managerDropdown.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                {t('managerDropdown.loading')}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600 text-sm">{error}</div>
            ) : filteredManagers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">{t('managerDropdown.noUsersFound')}</div>
            ) : (
              filteredManagers.map((manager) => (
                <button
                  key={manager.user_id}
                  type="button"
                  onClick={() => handleSelect(manager)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{manager.first_name} {manager.last_name}</div>
                  <div className="text-sm text-gray-500">{manager.email}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}