import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRequirementById,
  deleteRequirementThunk,
} from '../../features/requirements/requirementSlice';
import quotationService from '../../features/quotations/quotationService';
import analysisService from '../../features/analysis/analysisService';
import { runAnalysisThunk } from '../../features/analysis/analysisSlice';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  UploadCloud,
  Play,
  FileText,
  DollarSign,
  Clock,
  Shield,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatDays,
  formatWarranty,
  formatScore,
  getEligibilityBadgeProps,
} from '../../utils/formatters';
import toast from 'react-hot-toast';

const RequirementDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentRequirement, isLoading: reqLoading } = useSelector(
    (state) => state.requirements
  );
  const { isRunning: analysisRunning } = useSelector((state) => state.analysis);

  const [quotations, setQuotations] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteQuotationId, setDeleteQuotationId] = useState(null);

  const loadAssociatedData = async () => {
    setLoadingData(true);
    try {
      await dispatch(fetchRequirementById(id));
      const [qRes, aRes] = await Promise.all([
        quotationService.getByRequirement(id).catch(() => ({ data: [] })),
        analysisService.getByRequirement(id).catch(() => ({ data: [] })),
      ]);
      setQuotations(qRes.data || []);
      setAnalyses(aRes.data || []);
    } catch {
      toast.error('Failed to load requirement details');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAssociatedData();
  }, [id]);

  const handleRunAnalysis = async () => {
    if (quotations.length === 0) {
      toast.error('Please upload at least one supplier quotation before analyzing');
      return;
    }
    try {
      toast.loading('AI agent is analyzing quotations...', { id: 'run-ai' });
      await dispatch(runAnalysisThunk(Number(id))).unwrap();
      toast.success('Quotation analysis completed successfully!', { id: 'run-ai' });
      navigate(`/analysis/${id}`);
    } catch (err) {
      toast.error(err || 'Failed to complete analysis', { id: 'run-ai' });
    }
  };

  const handleDeleteRequirement = async () => {
    try {
      await dispatch(deleteRequirementThunk(Number(id))).unwrap();
      toast.success('Requirement deleted');
      navigate('/requirements');
    } catch (err) {
      toast.error(err || 'Failed to delete requirement');
    }
  };

  const handleDeleteQuotation = async () => {
    if (!deleteQuotationId) return;
    try {
      await quotationService.delete(deleteQuotationId);
      toast.success('Quotation deleted successfully');
      setQuotations((prev) => prev.filter((q) => q.id !== deleteQuotationId));
      setDeleteQuotationId(null);
    } catch (err) {
      toast.error('Failed to delete quotation');
    }
  };

  if (reqLoading || (loadingData && !currentRequirement)) {
    return <Loader message="Loading requirement details..." />;
  }

  if (!currentRequirement) {
    return (
      <EmptyState
        title="Requirement not found"
        description="The purchase requirement you requested could not be located."
        actionText="Back to Requirements"
        onAction={() => navigate('/requirements')}
      />
    );
  }

  const quotationColumns = [
    {
      header: 'Supplier Name',
      accessor: 'supplierName',
      cell: (row) => (
        <span className="font-semibold text-gray-900">{row.supplierName}</span>
      ),
    },
    {
      header: 'File Name',
      accessor: 'fileName',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[180px] text-xs font-medium text-gray-700">
            {row.fileName}
          </span>
        </div>
      ),
    },
    {
      header: 'Extraction Status',
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
        <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.fileUrl && (
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1"
            >
              <span>View PDF</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteQuotationId(row.id)}
            title="Delete Quotation"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2EAE4]">
        <div className="flex items-center gap-3">
          <Link to="/requirements">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Requirements
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#17211B]">{currentRequirement.title}</h2>
            <p className="text-xs text-[#647067]">
              Created on {formatDate(currentRequirement.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={Play}
            onClick={handleRunAnalysis}
            isLoading={analysisRunning}
            disabled={quotations.length === 0}
          >
            Run AI Analysis
          </Button>

          <Link to={`/quotations/upload?requirementId=${id}`}>
            <Button variant="secondary" size="sm" icon={UploadCloud}>
              Upload Quotation
            </Button>
          </Link>

          <Link to={`/requirements/${id}/edit`}>
            <Button variant="outline" size="sm" icon={Edit2}>
              Edit
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            className="text-red-600 hover:bg-red-50 hover:border-red-200"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Description if present */}
      {currentRequirement.description && (
        <div className="p-4 rounded-xl bg-white border border-[#E2EAE4] text-xs sm:text-sm text-gray-700">
          <span className="font-semibold text-gray-900 block mb-1">Specifications:</span>
          {currentRequirement.description}
        </div>
      )}

      {/* Key Parameters Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#647067] uppercase tracking-wider block">
            Target / Max Price
          </span>
          <span className="text-lg font-bold text-[#17211B] mt-1 block">
            {formatCurrency(currentRequirement.maxPrice)}
          </span>
          <span className="text-[11px] text-[#647067]">Threshold condition</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#647067] uppercase tracking-wider block">
            Quantity
          </span>
          <span className="text-lg font-bold text-[#17211B] mt-1 block">
            {currentRequirement.quantity ? currentRequirement.quantity.toLocaleString() : 'Open'}
          </span>
          <span className="text-[11px] text-[#647067]">Units required</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#647067] uppercase tracking-wider block">
            Max Delivery
          </span>
          <span className="text-lg font-bold text-[#17211B] mt-1 block">
            {formatDays(currentRequirement.maxDeliveryDays)}
          </span>
          <span className="text-[11px] text-[#647067]">Lead time threshold</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#647067] uppercase tracking-wider block">
            Min Warranty
          </span>
          <span className="text-lg font-bold text-[#17211B] mt-1 block">
            {formatWarranty(currentRequirement.minWarrantyYears)}
          </span>
          <span className="text-[11px] text-[#647067]">Coverage duration</span>
        </div>
      </div>

      {/* Criteria Weights & Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Evaluation Criteria Allocation" subtitle="Weights configured for this requirement">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">Price Weight</span>
                <span className="text-emerald-700">{currentRequirement.priceWeight}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${currentRequirement.priceWeight}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">Delivery Speed Weight</span>
                <span className="text-emerald-700">{currentRequirement.deliveryWeight}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${currentRequirement.deliveryWeight}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">Warranty Coverage Weight</span>
                <span className="text-emerald-700">{currentRequirement.warrantyWeight}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${currentRequirement.warrantyWeight}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Procurement Terms & Conditions" subtitle="Mandatory contract & payment guidelines">
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#E2EAE4]">
              <span className="text-[#647067]">Payment Terms</span>
              <span className="font-semibold text-gray-900">
                {currentRequirement.paymentTerms || 'Standard Commercial Terms'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#E2EAE4]">
              <span className="text-[#647067]">Mandatory Compliance Rule</span>
              <span className="font-semibold text-emerald-700">
                All 4 criteria checked before scoring
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#647067]">Multiple Extracted Items</span>
              <span className="font-semibold text-amber-700">
                Requires manual verification (No silent scoring)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Analysis Status Banner (if analysis already exists) */}
      {analyses.length > 0 && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Completed Analysis Available ({analyses.length} Suppliers Evaluated)
              </h4>
              <p className="text-xs text-emerald-800">
                AI evaluation rankings, compliance explanations, and recommendation results are ready.
              </p>
            </div>
          </div>
          <Link to={`/analysis/${id}`}>
            <Button variant="primary" size="sm">
              View Analysis Results
            </Button>
          </Link>
        </div>
      )}

      {/* Uploaded Supplier Quotations Section */}
      <Card
        title={`Uploaded Supplier Quotations (${quotations.length})`}
        subtitle="Quotations attached to this purchase requirement"
        headerAction={
          <Link to={`/quotations/upload?requirementId=${id}`}>
            <Button variant="outline" size="sm" icon={UploadCloud}>
              Upload PDF
            </Button>
          </Link>
        }
        noPadding
      >
        {quotations.length === 0 ? (
          <EmptyState
            title="No quotations uploaded yet"
            description="Upload PDF quotations from your candidate suppliers to enable AI comparison and scoring."
            actionText="Upload First Quotation"
            onAction={() => navigate(`/quotations/upload?requirementId=${id}`)}
            className="border-none"
          />
        ) : (
          <DataTable columns={quotationColumns} data={quotations} />
        )}
      </Card>

      {/* Delete Requirement Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRequirement}
        title="Delete Purchase Requirement"
        message="Are you sure? This will permanently delete this requirement along with all uploaded quotations and analysis reports."
      />

      {/* Delete Quotation Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteQuotationId)}
        onClose={() => setDeleteQuotationId(null)}
        onConfirm={handleDeleteQuotation}
        title="Delete Supplier Quotation"
        message="Are you sure you want to delete this supplier quotation? If it was included in an analysis, you will need to re-run the analysis."
      />
    </div>
  );
};

export default RequirementDetails;
