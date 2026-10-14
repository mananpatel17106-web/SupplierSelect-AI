import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRequirements,
  fetchRequirementById,
} from '../../features/requirements/requirementSlice';
import {
  runAnalysisThunk,
  fetchAnalysisByRequirement,
} from '../../features/analysis/analysisSlice';
import quotationService from '../../features/quotations/quotationService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  Play,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  FileText,
  DollarSign,
  Clock,
  Shield,
  Layers,
  Info,
  Scale,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatScore,
  getEligibilityBadgeProps,
} from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const AnalysisResults = () => {
  const { requirementId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { requirements } = useSelector((state) => state.requirements);
  const { isRunning } = useSelector((state) => state.analysis);

  const [selectedReqId, setSelectedReqId] = useState(requirementId || '');
  const [requirement, setRequirement] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [analysisData, setAnalysisData] = useState(null); // { suppliers: [], recommendation: {} }
  const [isLoading, setIsLoading] = useState(true);

  // Initialize requirements list
  useEffect(() => {
    dispatch(fetchRequirements());
  }, [dispatch]);

  // Sync selectedReqId when URL parameter changes or default to first available requirement
  useEffect(() => {
    if (requirementId) {
      setSelectedReqId(requirementId);
    } else if (!selectedReqId && requirements.length > 0) {
      setSelectedReqId(String(requirements[0].id));
    }
  }, [requirementId, selectedReqId, requirements]);

  // Load requirement, quotations, and analysis data whenever selectedReqId changes
  const loadData = async (reqId) => {
    if (!reqId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [reqAction, qRes, aRes] = await Promise.all([
        dispatch(fetchRequirementById(reqId)),
        quotationService.getByRequirement(reqId).catch(() => ({ data: [] })),
        dispatch(fetchAnalysisByRequirement(reqId)),
      ]);

      const req = reqAction.payload;
      setRequirement(req);
      setQuotations(qRes.data || []);

      const savedAnalyses = aRes.payload || [];

      if (savedAnalyses.length > 0) {
        // Construct analysisData structure from GET /analysis/requirement/:id
        // (savedAnalyses has rank, totalScore, priceScore, explanation, warnings, etc.)
        const sorted = [...savedAnalyses].sort((a, b) => {
          if (a.rank && b.rank) return a.rank - b.rank;
          if (a.rank) return -1;
          if (b.rank) return 1;
          return (b.totalScore || 0) - (a.totalScore || 0);
        });

        const best = sorted.find((s) => s.rank === 1 && s.eligibilityStatus === 'eligible');

        setAnalysisData({
          suppliers: sorted.map((s) => ({
            supplierId: s.quotationId,
            supplierName: s.supplierName,
            eligibilityStatus: s.eligibilityStatus,
            mandatoryStatus: s.mandatoryStatus,
            priceScore: s.priceScore,
            deliveryScore: s.deliveryScore,
            warrantyScore: s.warrantyScore,
            totalScore: s.totalScore,
            rank: s.rank,
            warnings: (() => {
              try {
                return typeof s.warnings === 'string' ? JSON.parse(s.warnings) : s.warnings || [];
              } catch {
                return s.warnings ? [s.warnings] : [];
              }
            })(),
            explanation: s.explanation,
          })),
          recommendation: best
            ? {
                hasRecommendation: true,
                supplierId: best.quotationId,
                supplierName: best.supplierName,
                totalScore: best.totalScore,
                rank: best.rank,
                explanation: best.explanation,
              }
            : {
                hasRecommendation: false,
                explanation: 'No eligible supplier is available for recommendation.',
              },
        });
      } else {
        setAnalysisData(null);
      }
    } catch {
      toast.error('Failed to load analysis data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReqId) {
      loadData(selectedReqId);
    }
  }, [selectedReqId]);

  const handleRunAnalysis = async () => {
    if (!selectedReqId) {
      toast.error('Please select a purchase requirement');
      return;
    }
    if (quotations.length === 0) {
      toast.error('No supplier quotations uploaded for this requirement');
      return;
    }

    try {
      toast.loading('Running AI evaluation & scoring agent...', { id: 'run-analysis' });
      const result = await dispatch(runAnalysisThunk(Number(selectedReqId))).unwrap();
      setAnalysisData(result);
      toast.success('Supplier analysis completed successfully!', { id: 'run-analysis' });
    } catch (err) {
      toast.error(err || 'Failed to complete analysis', { id: 'run-analysis' });
    }
  };

  // Prepare chart data for supplier comparison
  const chartData = (analysisData?.suppliers || []).map((s) => ({
    name: s.supplierName.length > 15 ? `${s.supplierName.substring(0, 15)}...` : s.supplierName,
    Total: Number(s.totalScore) || 0,
    Price: Number(s.priceScore) || 0,
    Delivery: Number(s.deliveryScore) || 0,
    Warranty: Number(s.warrantyScore) || 0,
  }));

  // Best recommendation
  const rec = analysisData?.recommendation;
  const bestSupplier = analysisData?.suppliers?.find((s) => s.supplierId === rec?.supplierId);

  // Check if there are newly added quotations that haven't been scored in current analysisData
  const unanalyzedCount = quotations.filter(
    (q) => !analysisData?.suppliers?.some((s) => s.supplierId === q.id)
  ).length;

  return (

    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Requirement Selection Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2EAE4]">
        <div>
          <h2 className="text-xl font-bold text-[#17211B]">
            Compare & Analyze Quotations
          </h2>
          <p className="text-xs text-[#647067] mt-0.5">
            Agentic AI decision support: mandatory requirement verification, weighted multi-criteria scoring, and risks.
          </p>
        </div>

        {/* Requirement Switcher */}
        <div className="flex items-center gap-3">
          <select
            value={selectedReqId}
            onChange={(e) => {
              setSelectedReqId(e.target.value);
              navigate(`/analysis/${e.target.value}`);
            }}
            className="text-xs bg-white border border-[#E2EAE4] rounded-lg px-3 py-2 text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-xs"
          >
            <option value="" disabled>
              Select Purchase Requirement...
            </option>
            {requirements.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          {selectedReqId && (
            <Button
              variant="primary"
              size="sm"
              icon={Play}
              onClick={handleRunAnalysis}
              isLoading={isRunning}
              disabled={quotations.length === 0}
            >
              {analysisData ? 'Re-run Analysis' : 'Run Analysis'}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <Loader message="Loading requirement and analysis data..." />
      ) : !selectedReqId ? (
        <EmptyState
          icon={Scale}
          title="Select a Purchase Requirement"
          description="Choose a purchase requirement from the dropdown above to inspect quotes and evaluate suppliers."
        />
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Quotations Uploaded"
          description={`Requirement "${requirement?.title}" does not have any supplier quotation PDFs yet.`}
          actionText="Upload Quotation PDF"
          onAction={() => navigate(`/quotations/upload?requirementId=${selectedReqId}`)}
        />
      ) : !analysisData ? (
        /* Ready to analyze empty state */
        <Card className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {quotations.length} {quotations.length === 1 ? 'Quotation' : 'Quotations'} Ready for AI Evaluation
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-6">
            QuoteWise AI will execute mandatory threshold verification, evaluate pricing, delivery, and warranty scores, and generate procurement recommendations.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={Play}
            onClick={handleRunAnalysis}
            isLoading={isRunning}
          >
            Execute AI Supplier Analysis
          </Button>
        </Card>
      ) : (
        /* Full Analysis Results View */
        <div className="space-y-6">
          {/* New Quotations Alert Banner */}
          {unanalyzedCount > 0 && (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/90 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-start sm:items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    {unanalyzedCount} new {unanalyzedCount === 1 ? 'quotation has' : 'quotations have'} been uploaded since last analysis
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Click 'Update Analysis' to evaluate all {quotations.length} quotations together in the ranking.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                onClick={handleRunAnalysis}
                isLoading={isRunning}
              >
                Update Analysis
              </Button>
            </div>
          )}

          {/* Section A: Best Supplier Recommendation Card */}
          {rec?.hasRecommendation ? (

            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 text-white rounded-2xl p-6 sm:p-7 shadow-lg shadow-emerald-700/15 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none rounded-l-full blur-xl" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shrink-0">
                    <Award className="w-8 h-8 text-emerald-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                        Recommended Winner
                      </span>
                      <span className="text-xs font-semibold text-emerald-100">
                        Rank #{rec.rank}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-white mt-1">
                      {rec.supplierName}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-white/10 p-3 sm:p-0 rounded-xl sm:bg-transparent">
                  <span className="text-xs text-emerald-100 block">Overall Score</span>
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {formatScore(rec.totalScore)}
                  </span>
                  <span className="text-[10px] text-emerald-200 block">Weighted 100-Point Scale</span>
                </div>
              </div>

              {/* Recommendation AI Explanation */}
              <div className="mt-5 pt-4 border-t border-white/15 relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-100 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Decision Support Explanation:</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed max-w-3xl">
                  {rec.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-950 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold text-amber-900">
                  No Eligible Supplier Qualified for Recommendation
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 mt-1">
                  {rec?.explanation ||
                    'All candidate suppliers failed one or more mandatory conditions, or require manual verification due to multiple extracted quotation items.'}
                </p>
              </div>
            </div>
          )}

          {/* Section B: Supplier Ranking Table */}
          <Card
            title="Supplier Evaluation & Ranking Table"
            subtitle="Strict mandatory checks evaluated prior to weighted criteria scoring"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2EAE4] text-left text-sm">
                <thead className="bg-[#F5FBF7]">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Rank</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Eligibility Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Price Score</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Delivery Score</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Warranty Score</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Total Score</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">Warnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EAE4] bg-white">
                  {analysisData.suppliers.map((supplier) => {
                    const badge = getEligibilityBadgeProps(supplier.eligibilityStatus);
                    const isWinner = rec?.hasRecommendation && supplier.supplierId === rec.supplierId;

                    return (
                      <tr
                        key={supplier.supplierId}
                        className={`transition-colors ${
                          isWinner ? 'bg-emerald-50/40 font-medium' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold text-gray-800">
                          {supplier.rank ? (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                supplier.rank === 1
                                  ? 'bg-emerald-600 text-white font-black'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {supplier.rank}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-sm text-[#17211B] font-semibold">
                          {supplier.supplierName}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-gray-700">
                          {formatScore(supplier.priceScore)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-gray-700">
                          {formatScore(supplier.deliveryScore)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-gray-700">
                          {formatScore(supplier.warrantyScore)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-sm font-bold ${
                              supplier.eligibilityStatus === 'eligible'
                                ? 'text-emerald-700'
                                : 'text-gray-400'
                            }`}
                          >
                            {formatScore(supplier.totalScore)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-amber-700 max-w-xs">
                          {supplier.warnings && supplier.warnings.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium text-[11px]">
                              <AlertTriangle className="w-3 h-3" />
                              {supplier.warnings.length} warning{supplier.warnings.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section C: Score Comparison Chart */}
          <Card
            title="Multi-Criteria Score Comparison"
            subtitle="Visual benchmarking of criteria scores across all suppliers"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAE4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#647067' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#647067' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.5rem',
                      border: '1px solid #E2EAE4',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Total" name="Total Weighted Score" fill="#15803D" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Price" name="Price Score" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Delivery" name="Delivery Score" fill="#34D399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Warranty" name="Warranty Score" fill="#6EE7B7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Section D & E: Supplier Explanations & Risk Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.suppliers.map((supplier) => (
              <Card
                key={supplier.supplierId}
                title={supplier.supplierName}
                headerAction={
                  <Badge variant={getEligibilityBadgeProps(supplier.eligibilityStatus).variant}>
                    {getEligibilityBadgeProps(supplier.eligibilityStatus).label}
                  </Badge>
                }
              >
                <div className="space-y-3 text-xs">
                  {/* Scores strip */}
                  <div className="grid grid-cols-4 gap-2 text-center p-2 rounded-lg bg-[#F5FBF7] border border-[#E2EAE4]">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Total</span>
                      <span className="font-bold text-gray-900">{formatScore(supplier.totalScore)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Price</span>
                      <span className="font-semibold text-gray-700">{formatScore(supplier.priceScore)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Delivery</span>
                      <span className="font-semibold text-gray-700">{formatScore(supplier.deliveryScore)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Warranty</span>
                      <span className="font-semibold text-gray-700">{formatScore(supplier.warrantyScore)}</span>
                    </div>
                  </div>

                  {/* Backend Explanation */}
                  {supplier.explanation && (
                    <div className="text-gray-700 leading-relaxed bg-white p-2 rounded border border-gray-100">
                      <strong>AI Rationale:</strong> {supplier.explanation}
                    </div>
                  )}

                  {/* Warnings */}
                  {supplier.warnings && supplier.warnings.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-amber-900 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Noted Warnings:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                        {supplier.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
