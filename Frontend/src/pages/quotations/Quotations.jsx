import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Search,
  FileText,
  ExternalLink,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';
import { fetchRequirements } from '../../features/requirements/requirementSlice';
import quotationService from '../../features/quotations/quotationService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, getEligibilityBadgeProps } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Quotations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requirements } = useSelector((state) => state.requirements);

  const [allQuotations, setAllQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequirementFilter, setSelectedRequirementFilter] = useState('');
  const [deleteQuotationId, setDeleteQuotationId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadQuotations = async () => {
    setIsLoading(true);
    try {
      const reqAction = await dispatch(fetchRequirements());
      const userRequirements = reqAction.payload || [];

      if (userRequirements.length > 0) {
        const quotationPromises = userRequirements.map((r) =>
          quotationService.getByRequirement(r.id).then((res) =>
            (res.data || []).map((q) => ({
              ...q,
              requirementTitle: r.title,
            }))
          ).catch(() => [])
        );

        const results = await Promise.all(quotationPromises);
        setAllQuotations(results.flat());
      } else {
        setAllQuotations([]);
      }
    } catch {
      toast.error('Failed to load supplier quotations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, [dispatch]);

  const handleDeleteQuotation = async () => {
    if (!deleteQuotationId) return;
    setIsDeleting(true);
    try {
      await quotationService.delete(deleteQuotationId);
      toast.success('Quotation deleted successfully');
      setAllQuotations((prev) => prev.filter((q) => q.id !== deleteQuotationId));
      setDeleteQuotationId(null);
    } catch {
      toast.error('Failed to delete quotation');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredQuotations = allQuotations.filter((q) => {
    const matchSearch =
      q.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.fileName && q.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.requirementTitle && q.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchReq =
      !selectedRequirementFilter || String(q.requirementId) === String(selectedRequirementFilter);

    return matchSearch && matchReq;
  });

  const columns = [
    {
      header: 'Supplier Name',
      accessor: 'supplierName',
      cell: (row) => (
        <span className="font-semibold text-gray-900 block truncate max-w-[200px]">
          {row.supplierName}
        </span>
      ),
    },
    {
      header: 'Associated Requirement',
      accessor: 'requirementTitle',
      cell: (row) => (
        <Link
          to={`/requirements/${row.requirementId}`}
          className="text-xs font-medium text-emerald-800 hover:text-emerald-900 hover:underline truncate block max-w-xs"
        >
          {row.requirementTitle || `Requirement #${row.requirementId}`}
        </Link>
      ),
    },
    {
      header: 'PDF Document',
      accessor: 'fileName',
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-[180px]">
          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs text-gray-600 truncate">{row.fileName}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const badge = getEligibilityBadgeProps(row.status);
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
    },
    {
      header: 'Uploaded Date',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-[#647067]">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.fileUrl && (
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Open PDF Document"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/quotations/${row.id}`)}
            title="Inspect Quotation"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteQuotationId(row.id)}
            title="Delete Quotation"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17211B]">Supplier Quotations</h2>
          <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
            Manage extracted quotation records and view document extractions.
          </p>
        </div>

        <Link to="/quotations/upload">
          <Button variant="primary" size="md" icon={UploadCloud}>
            Upload Quotation PDF
          </Button>
        </Link>
      </div>

      {/* Search & Requirement Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by supplier or file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#647067] whitespace-nowrap">Filter by:</span>
          <select
            value={selectedRequirementFilter}
            onChange={(e) => setSelectedRequirementFilter(e.target.value)}
            className="text-xs bg-white border border-[#E2EAE4] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-56"
          >
            <option value="">All Requirements</option>
            {requirements.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      {filteredQuotations.length === 0 && !isLoading ? (
        <EmptyState
          title={searchQuery || selectedRequirementFilter ? 'No matching quotations' : 'No quotations uploaded yet'}
          description={
            searchQuery || selectedRequirementFilter
              ? 'Try modifying your filters or search keywords.'
              : 'Upload quotation PDFs to begin comparing supplier bids.'
          }
          actionText={
            searchQuery || selectedRequirementFilter
              ? 'Reset Filters'
              : 'Upload First Quotation'
          }
          onAction={
            searchQuery || selectedRequirementFilter
              ? () => {
                  setSearchQuery('');
                  setSelectedRequirementFilter('');
                }
              : () => navigate('/quotations/upload')
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredQuotations}
          isLoading={isLoading}
          onRowClick={(row) => navigate(`/quotations/${row.id}`)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteQuotationId)}
        onClose={() => setDeleteQuotationId(null)}
        onConfirm={handleDeleteQuotation}
        title="Delete Supplier Quotation"
        message="Are you sure you want to delete this quotation? This cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Quotations;
