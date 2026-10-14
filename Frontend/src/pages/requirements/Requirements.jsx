import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Filter,
  FileText,
  Scale,
  Calendar,
  DollarSign,
  Clock,
  Shield,
} from 'lucide-react';
import {
  fetchRequirements,
  deleteRequirementThunk,
} from '../../features/requirements/requirementSlice';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate, formatDays, formatWarranty } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Requirements = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requirements, isLoading, error } = useSelector((state) => state.requirements);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'title', 'price'
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchRequirements());
  }, [dispatch]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteRequirementThunk(deleteTargetId)).unwrap();
      toast.success('Purchase requirement deleted successfully');
      setDeleteTargetId(null);
    } catch (err) {
      toast.error(err || 'Failed to delete requirement');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Sort
  const filteredRequirements = requirements
    .filter((req) => {
      const matchSearch =
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.description && req.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (req.paymentTerms && req.paymentTerms.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'price') return (b.maxPrice || 0) - (a.maxPrice || 0);
      return 0;
    });

  const columns = [
    {
      header: 'Title & Description',
      accessor: 'title',
      cell: (row) => (
        <div className="max-w-xs">
          <Link
            to={`/requirements/${row.id}`}
            className="font-semibold text-emerald-800 hover:text-emerald-900 transition-colors block truncate"
          >
            {row.title}
          </Link>
          {row.description && (
            <p className="text-xs text-[#647067] truncate mt-0.5">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      cell: (row) => (
        <span className="font-medium text-gray-800">
          {row.quantity !== null && row.quantity !== undefined ? row.quantity.toLocaleString() : '—'}
        </span>
      ),
    },
    {
      header: 'Target / Max Price',
      accessor: 'maxPrice',
      cell: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.maxPrice)}
        </span>
      ),
    },
    {
      header: 'Max Delivery',
      accessor: 'maxDeliveryDays',
      cell: (row) => formatDays(row.maxDeliveryDays),
    },
    {
      header: 'Min Warranty',
      accessor: 'minWarrantyYears',
      cell: (row) => formatWarranty(row.minWarrantyYears),
    },
    {
      header: 'Evaluation Weights',
      accessor: 'weights',
      cell: (row) => (
        <div className="text-[11px] text-[#647067] font-medium space-y-0.5">
          <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded mr-1">
            Price: {row.priceWeight}%
          </span>
          <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded mr-1">
            Delivery: {row.deliveryWeight}%
          </span>
          <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">
            Warranty: {row.warrantyWeight}%
          </span>
        </div>
      ),
    },
    {
      header: 'Created Date',
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
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/requirements/${row.id}`);
            }}
            title="Inspect Requirement"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/requirements/${row.id}/edit`);
            }}
            title="Edit Requirement"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTargetId(row.id);
            }}
            title="Delete Requirement"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17211B]">Purchase Requirements</h2>
          <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
            Create, manage, and benchmark procurement conditions for your organization.
          </p>
        </div>

        <Link to="/requirements/new">
          <Button variant="primary" size="md" icon={Plus}>
            Create Requirement
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search by title, description, or payment terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-[#647067] whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-[#E2EAE4] rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A - Z)</option>
            <option value="price">Highest Budget</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      {filteredRequirements.length === 0 && !isLoading ? (
        <EmptyState
          title={searchQuery ? 'No matching requirements found' : 'No requirements created yet'}
          description={
            searchQuery
              ? 'Try modifying your search terms or filters.'
              : 'Add your first purchase requirement with budget limits, quantities, and weights.'
          }
          actionText={searchQuery ? 'Clear Search' : 'Create Requirement'}
          onAction={
            searchQuery
              ? () => setSearchQuery('')
              : () => navigate('/requirements/new')
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredRequirements}
          isLoading={isLoading}
          onRowClick={(row) => navigate(`/requirements/${row.id}`)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase Requirement"
        message="Are you sure you want to delete this purchase requirement? All associated supplier quotations and analysis records will also be permanently deleted."
        confirmText="Permanently Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Requirements;
