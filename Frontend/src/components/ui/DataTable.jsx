import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Button from './Button';

const DataTable = ({
  columns,
  data = [],
  keyExtractor = (row, index) => row.id || index,
  isLoading = false,
  emptyMessage = 'No records found',
  pagination,
  onRowClick,
  className = '',
}) => {
  return (
    <div className={`overflow-hidden border border-[#E2EAE4] rounded-xl bg-white shadow-2xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#E2EAE4] text-left text-sm">
          <thead className="bg-[#F5FBF7]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#647067] ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2EAE4] bg-white">
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={keyExtractor(row, rIdx)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F5FBF7]/60' : 'hover:bg-gray-50/50'
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-5 py-3.5 whitespace-nowrap text-sm text-[#17211B] ${
                        col.className || ''
                      }`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-5 py-3 border-t border-[#E2EAE4] bg-[#F5FBF7]/30 flex items-center justify-between">
          <p className="text-xs text-[#647067]">
            Page <span className="font-semibold text-gray-900">{pagination.currentPage}</span> of{' '}
            <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
