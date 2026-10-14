import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  ArrowRight,
  Award,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { fetchRequirements } from '../../features/requirements/requirementSlice';
import analysisService from '../../features/analysis/analysisService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatScore } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AnalysisHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { requirements } = useSelector((state) => state.requirements);
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const reqAction = await dispatch(fetchRequirements());
      const userRequirements = reqAction.payload || [];

      if (userRequirements.length > 0) {
        // Query analysis records for each requirement
        const analysisPromises = userRequirements.map((r) =>
          analysisService
            .getByRequirement(r.id)
            .then((res) => ({
              requirement: r,
              analyses: res.data || [],
            }))
            .catch(() => ({
              requirement: r,
              analyses: [],
            }))
        );

        const results = await Promise.all(analysisPromises);

        // Filter requirements that actually have completed analysis records
        const activeHistory = results
          .filter((item) => item.analyses.length > 0)
          .map((item) => {
            const best = item.analyses.find(
              (a) => a.rank === 1 && a.eligibilityStatus === 'eligible'
            );
            const latestTimestamp = item.analyses.reduce((latest, a) => {
              const d = new Date(a.updatedAt || a.createdAt);
              return d > latest ? d : latest;
            }, new Date(0));

            return {
              id: item.requirement.id,
              requirementTitle: item.requirement.title,
              supplierCount: item.analyses.length,
              eligibleCount: item.analyses.filter((a) => a.eligibilityStatus === 'eligible').length,
              bestSupplier: best ? best.supplierName : 'None eligible',
              bestScore: best ? best.totalScore : null,
              analyzedDate: latestTimestamp.getTime() > 0 ? latestTimestamp.toISOString() : item.requirement.updatedAt,
            };
          });

        setHistoryItems(activeHistory);
      } else {
        setHistoryItems([]);
      }
    } catch {
      toast.error('Failed to load past evaluations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [dispatch]);

  const filteredHistory = historyItems.filter((item) =>
    item.requirementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.bestSupplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: 'Purchase Requirement',
      accessor: 'requirementTitle',
      cell: (row) => (
        <div className="max-w-xs">
          <Link
            to={`/analysis/${row.id}`}
            className="font-semibold text-emerald-800 hover:text-emerald-950 transition-colors block truncate"
          >
            {row.requirementTitle}
          </Link>
          <span className="text-[11px] text-[#647067]">ID: #{row.id}</span>
        </div>
      ),
    },
    {
      header: 'Evaluated Suppliers',
      accessor: 'supplierCount',
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-800">
          {row.supplierCount} {row.supplierCount === 1 ? 'supplier' : 'suppliers'} (
          {row.eligibleCount} eligible)
        </span>
      ),
    },
    {
      header: 'Best Recommended Supplier',
      accessor: 'bestSupplier',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.bestScore !== null ? (
            <>
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-gray-900 text-xs">
                {row.bestSupplier}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {formatScore(row.bestScore)} pts
              </span>
            </>
          ) : (
            <span className="text-xs text-amber-700 italic">No eligible winner</span>
          )}
        </div>
      ),
    },
    {
      header: 'Evaluation Date',
      accessor: 'analyzedDate',
      cell: (row) => (
        <span className="text-xs text-[#647067]">{formatDate(row.analyzedDate)}</span>
      ),
    },
    {
      header: 'Action',
      accessor: 'actions',
      className: 'text-right',
      cell: (row) => (
        <div className="text-right">
          <Link to={`/analysis/${row.id}`}>
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              View Report
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2EAE4]">
        <div>
          <h2 className="text-xl font-bold text-[#17211B]">Analysis History</h2>
          <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
            Revisit past multi-criteria evaluations, rankings, and winner recommendations.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search by requirement or recommended supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length === 0 && !isLoading ? (
        <EmptyState
          icon={History}
          title={searchQuery ? 'No matching history found' : 'No past analyses found'}
          description={
            searchQuery
              ? 'Try modifying your search keywords.'
              : 'Execute an AI analysis on any purchase requirement to build your decision history.'
          }
          actionText={searchQuery ? 'Clear Search' : 'Go to Requirements'}
          onAction={
            searchQuery
              ? () => setSearchQuery('')
              : () => navigate('/requirements')
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredHistory}
          isLoading={isLoading}
          onRowClick={(row) => navigate(`/analysis/${row.id}`)}
        />
      )}
    </div>
  );
};

export default AnalysisHistory;
