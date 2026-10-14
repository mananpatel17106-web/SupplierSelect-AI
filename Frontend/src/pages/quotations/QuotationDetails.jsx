import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import quotationService from '../../features/quotations/quotationService';
import analysisService from '../../features/analysis/analysisService';
import requirementService from '../../features/requirements/requirementService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  Trash2,
  Building,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Award,
  Sparkles,
  DollarSign,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import {
  formatDate,
  formatScore,
  getEligibilityBadgeProps,
} from '../../utils/formatters';
import toast from 'react-hot-toast';

const QuotationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [requirement, setRequirement] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const qRes = await quotationService.getById(id);
        const qData = qRes.data;
        setQuotation(qData);

        if (qData?.requirementId) {
          const reqRes = await requirementService.getById(qData.requirementId).catch(() => null);
          setRequirement(reqRes?.data || null);
        }

        // Try to fetch existing analysis for this quotation
        const aRes = await analysisService.getByQuotation(id).catch(() => null);
        setAnalysis(aRes?.data || null);
      } catch {
        toast.error('Failed to load quotation details');
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await quotationService.delete(id);
      toast.success('Quotation deleted successfully');
      navigate(quotation?.requirementId ? `/requirements/${quotation.requirementId}` : '/quotations');
    } catch (err) {
      toast.error(err || 'Failed to delete quotation');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loader message="Loading quotation details..." />;
  }

  if (!quotation) {
    return (
      <EmptyState
        title="Quotation not found"
        description="The quotation you requested could not be located."
        actionText="Back to Quotations"
        onAction={() => navigate('/quotations')}
      />
    );
  }

  // Parse warnings safely
  let parsedWarnings = [];
  if (analysis?.warnings) {
    try {
      parsedWarnings = typeof analysis.warnings === 'string'
        ? JSON.parse(analysis.warnings)
        : analysis.warnings;
    } catch {
      parsedWarnings = [analysis.warnings];
    }
  }

  const statusBadge = getEligibilityBadgeProps(analysis?.eligibilityStatus || quotation.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2EAE4]">
        <div className="flex items-center gap-3">
          <Link to="/quotations">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Quotations
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#17211B]">{quotation.supplierName}</h2>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
            <p className="text-xs text-[#647067] mt-0.5">
              Uploaded on {formatDate(quotation.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quotation.fileUrl && (
            <a href={quotation.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" icon={ExternalLink}>
                View Original PDF
              </Button>
            </a>
          )}
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

      {/* Grid: Quotation Meta & Associated Requirement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Metadata Card */}
        <Card title="Document Metadata" subtitle="File details and extraction record">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E2EAE4]">
              <span className="text-gray-500">Supplier Name:</span>
              <span className="font-semibold text-gray-900">{quotation.supplierName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2EAE4]">
              <span className="text-gray-500">File Name:</span>
              <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                {quotation.fileName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2EAE4]">
              <span className="text-gray-500">Format:</span>
              <span className="uppercase font-semibold text-gray-900">{quotation.fileType}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Extraction Status:</span>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
          </div>
        </Card>

        {/* Associated Requirement Card */}
        <Card title="Associated Requirement" subtitle="Procurement benchmark criteria">
          {requirement ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E2EAE4]">
                <span className="text-gray-500">Title:</span>
                <Link
                  to={`/requirements/${requirement.id}`}
                  className="font-semibold text-emerald-700 hover:underline truncate max-w-[200px]"
                >
                  {requirement.title}
                </Link>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2EAE4]">
                <span className="text-gray-500">Max Budget:</span>
                <span className="font-semibold text-gray-900">
                  {requirement.maxPrice ? `$${requirement.maxPrice}` : 'Open'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2EAE4]">
                <span className="text-gray-500">Max Lead Time:</span>
                <span className="font-semibold text-gray-900">
                  {requirement.maxDeliveryDays ? `${requirement.maxDeliveryDays} days` : 'Any'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Min Warranty:</span>
                <span className="font-semibold text-gray-900">
                  {requirement.minWarrantyYears ? `${requirement.minWarrantyYears} yrs` : 'None'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No linked requirement found.</p>
          )}
        </Card>
      </div>

      {/* AI Evaluation Results (if analyzed) */}
      {analysis ? (
        <div className="space-y-4">
          <Card
            title="AI Evaluation & Scoring Results"
            subtitle={`Computed rank and multi-criteria breakdown for ${quotation.supplierName}`}
            headerAction={
              analysis.rank ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Rank #{analysis.rank}</span>
                </div>
              ) : null
            }
          >
            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#F5FBF7] border border-[#E2EAE4] text-center">
                <span className="text-[11px] font-semibold text-[#647067] uppercase block">
                  Total Score
                </span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  {formatScore(analysis.totalScore)}
                </span>
                <span className="text-[10px] text-gray-500">Out of 100</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2EAE4] text-center">
                <span className="text-[11px] font-semibold text-[#647067] uppercase block">
                  Price Score
                </span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">
                  {formatScore(analysis.priceScore)}
                </span>
                <span className="text-[10px] text-gray-500">Lowest price ratio</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2EAE4] text-center">
                <span className="text-[11px] font-semibold text-[#647067] uppercase block">
                  Delivery Score
                </span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">
                  {formatScore(analysis.deliveryScore)}
                </span>
                <span className="text-[10px] text-gray-500">Fastest lead time ratio</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2EAE4] text-center">
                <span className="text-[11px] font-semibold text-[#647067] uppercase block">
                  Warranty Score
                </span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">
                  {formatScore(analysis.warrantyScore)}
                </span>
                <span className="text-[10px] text-gray-500">Coverage duration ratio</span>
              </div>
            </div>

            {/* AI Explanation Text */}
            {analysis.explanation && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 mb-4">
                <div className="flex items-center gap-2 font-bold mb-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Agent Evaluation Reasoning:</span>
                </div>
                <p className="leading-relaxed">{analysis.explanation}</p>
              </div>
            )}

            {/* Risk Warnings Panel */}
            {parsedWarnings.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold mb-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Identified Risks & Backend Warnings ({parsedWarnings.length}):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  {parsedWarnings.map((warn, wIdx) => (
                    <li key={wIdx}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card title="AI Analysis Status">
          <div className="p-6 text-center text-xs text-gray-500">
            <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-gray-800 text-sm">Not Yet Analyzed</p>
            <p className="mt-1">
              This quotation has been extracted but full comparative scoring runs in the requirement analysis workflow.
            </p>
            {quotation.requirementId && (
              <Link to={`/requirements/${quotation.requirementId}`} className="inline-block mt-4">
                <Button variant="primary" size="sm">
                  Go to Requirement & Run Analysis
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Quotation"
        message="Are you sure you want to delete this supplier quotation? It will be removed from future comparative analysis."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default QuotationDetails;
