import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  FileText,
  Scale,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Award,
} from 'lucide-react';
import { fetchRequirements } from '../../features/requirements/requirementSlice';
import requirementService from '../../features/requirements/requirementService';
import quotationService from '../../features/quotations/quotationService';
import analysisService from '../../features/analysis/analysisService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatCurrency, formatScore, getEligibilityBadgeProps } from '../../utils/formatters';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const ELIGIBILITY_COLORS = {
  Eligible: '#10B981',
  'Needs Verification': '#F59E0B',
  Ineligible: '#EF4444',
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { requirements, isLoading: reqLoading } = useSelector((state) => state.requirements);

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [quotationsMap, setQuotationsMap] = useState({});
  const [analysesMap, setAnalysesMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Load all user requirements and their respective quotations & analysis records
  const loadDashboardData = async () => {
    setLoadingDetails(true);
    try {
      const reqAction = await dispatch(fetchRequirements());
      const userRequirements = reqAction.payload || [];

      if (userRequirements.length > 0) {
        // Fetch quotations and analysis records in parallel for all user requirements
        const quotationPromises = userRequirements.map((r) =>
          quotationService.getByRequirement(r.id).catch(() => ({ data: [] }))
        );
        const analysisPromises = userRequirements.map((r) =>
          analysisService.getByRequirement(r.id).catch(() => ({ data: [] }))
        );

        const [quotationResults, analysisResults] = await Promise.all([
          Promise.all(quotationPromises),
          Promise.all(analysisPromises),
        ]);

        const qMap = {};
        const aMap = {};

        userRequirements.forEach((r, idx) => {
          qMap[r.id] = (quotationResults[idx]?.data || []).map((q) => ({
            ...q,
            requirementId: r.id,
          }));
          aMap[r.id] = (analysisResults[idx]?.data || []).map((a) => ({
            ...a,
            requirementId: r.id,
          }));
        });

        setQuotationsMap(qMap);
        setAnalysesMap(aMap);
      } else {
        setQuotationsMap({});
        setAnalysesMap({});
      }
    } finally {
      setLoadingDetails(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Compute actual aggregated metrics
  const totalRequirements = requirements?.length || 0;
  const allQuotations = Object.values(quotationsMap).flat();
  const totalQuotations = allQuotations.length;

  const allAnalyses = Object.values(analysesMap).flat();
  const totalCompletedAnalyses = Object.keys(analysesMap).filter(
    (reqId) => analysesMap[reqId]?.length > 0
  ).length;

  const eligibleCount = allAnalyses.filter(
    (a) => a.eligibilityStatus === 'eligible'
  ).length;
  const verificationCount = allAnalyses.filter(
    (a) => a.eligibilityStatus === 'needs_verification'
  ).length;
  const ineligibleCount = allAnalyses.filter(
    (a) => a.eligibilityStatus === 'ineligible'
  ).length;

  // Chart data: Eligibility Distribution
  const eligibilityData = [
    { name: 'Eligible', value: eligibleCount },
    { name: 'Needs Verification', value: verificationCount },
    { name: 'Ineligible', value: ineligibleCount },
  ].filter((item) => item.value > 0);

  // Chart data: Top analyzed requirements & supplier counts
  const requirementStatsData = requirements.slice(0, 5).map((r) => ({
    name: r.title.length > 14 ? `${r.title.substring(0, 14)}...` : r.title,
    quotations: quotationsMap[r.id]?.length || 0,
    evaluated: analysesMap[r.id]?.length || 0,
  }));

  // Best ranked supplier overall
  const bestEvaluatedSupplier = allAnalyses
    .filter((a) => a.rank === 1 && a.eligibilityStatus === 'eligible')
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))[0];

  const isLoading = reqLoading || loadingDetails;

  return (
    <div className="space-y-6">
      {/* Welcome & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2EAE4]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#17211B] tracking-tight">
            Welcome back, {user?.name || 'Procurement Officer'}
          </h2>
          <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
            Here is your real-time procurement pipeline and supplier decision status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            icon={RefreshCw}
          >
            Refresh Data
          </Button>
          <Link to="/requirements/new">
            <Button variant="primary" size="sm" icon={Plus}>
              New Requirement
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Requirements */}
        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#647067] uppercase tracking-wider">
              Requirements
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[#17211B]">
              {isLoading ? '—' : totalRequirements}
            </span>
            <span className="block text-[11px] text-[#647067] mt-0.5">Active projects</span>
          </div>
        </div>

        {/* Total Quotations */}
        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#647067] uppercase tracking-wider">
              Quotations
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[#17211B]">
              {isLoading ? '—' : totalQuotations}
            </span>
            <span className="block text-[11px] text-[#647067] mt-0.5">Uploaded PDFs</span>
          </div>
        </div>

        {/* Completed Analyses */}
        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#647067] uppercase tracking-wider">
              Evaluations
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[#17211B]">
              {isLoading ? '—' : totalCompletedAnalyses}
            </span>
            <span className="block text-[11px] text-[#647067] mt-0.5">Requirements analyzed</span>
          </div>
        </div>

        {/* Eligible Suppliers */}
        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#647067] uppercase tracking-wider">
              Eligible
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600">
              {isLoading ? '—' : eligibleCount}
            </span>
            <span className="block text-[11px] text-[#647067] mt-0.5">Passed checks</span>
          </div>
        </div>

        {/* Needs Verification */}
        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#647067] uppercase tracking-wider">
              Verification
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-600">
              {isLoading ? '—' : verificationCount}
            </span>
            <span className="block text-[11px] text-[#647067] mt-0.5">Multi-item quotations</span>
          </div>
        </div>

        {/* Ineligible */}
        <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs hover:border-red-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#647067] uppercase tracking-wider">
              Ineligible
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-red-600">
              {isLoading ? '—' : ineligibleCount}
            </span>
            <span className="block text-[11px] text-[#647067] mt-0.5">Failed conditions</span>
          </div>
        </div>
      </div>

      {/* Top Banner: Best-Ranked Supplier Highlight (if exists) */}
      {bestEvaluatedSupplier && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  Top Ranked Eligible Supplier
                </span>
                <span className="text-xs font-semibold text-[#647067]">
                  Rank #{bestEvaluatedSupplier.rank}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#17211B] mt-1">
                {bestEvaluatedSupplier.supplierName}
              </h3>
              <p className="text-xs text-[#647067] line-clamp-1 max-w-xl">
                {bestEvaluatedSupplier.explanation ||
                  'Satisfied all mandatory requirements and received the highest overall score.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <div className="text-right">
              <span className="text-xs text-[#647067] block">Overall Score</span>
              <span className="text-2xl font-black text-emerald-600">
                {formatScore(bestEvaluatedSupplier.totalScore)}
              </span>
            </div>
            <Link to={bestEvaluatedSupplier.requirementId ? `/analysis/${bestEvaluatedSupplier.requirementId}` : '/analysis'}>
              <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                View Evaluation
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Eligibility Status Breakdown */}
        <Card
          title="Supplier Eligibility Distribution"
          subtitle="Proportion of verified, eligible, and excluded supplier bids"
        >
          {eligibilityData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <Scale className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium">No analysis results yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Upload quotation PDFs and trigger AI analysis to see eligibility stats.
              </p>
            </div>
          ) : (
            <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
              <div className="w-full sm:w-1/2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eligibilityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {eligibilityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ELIGIBILITY_COLORS[entry.name] || '#94A399'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} suppliers`, name]}
                      contentStyle={{
                        borderRadius: '0.5rem',
                        border: '1px solid #E2EAE4',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 space-y-2 mt-4 sm:mt-0 pl-4">
                {eligibilityData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: ELIGIBILITY_COLORS[item.name] || '#94A399',
                        }}
                      />
                      <span className="font-medium text-[#17211B]">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Chart 2: Pipeline Activity Overview */}
        <Card
          title="Procurement Activity Overview"
          subtitle="Quotations received vs. analyzed for recent requirements"
        >
          {requirementStatsData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <ClipboardList className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium">No requirements created yet</p>
              <Link to="/requirements/new" className="mt-3">
                <Button variant="outline" size="sm" icon={Plus}>
                  Create Requirement
                </Button>
              </Link>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requirementStatsData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAE4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#647067' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#647067' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.5rem',
                      border: '1px solid #E2EAE4',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="quotations" name="Quotations Uploaded" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evaluated" name="AI Evaluated" fill="#15803D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Row: Recent Requirements & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Requirements (2 Columns) */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Purchase Requirements"
            subtitle="Your latest procurement criteria and supplier quotes"
            headerAction={
              <Link to="/requirements">
                <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                  View All
                </Button>
              </Link>
            }
            noPadding
          >
            {requirements.length === 0 ? (
              <EmptyState
                title="No purchase requirements yet"
                description="Get started by creating your first purchase requirement with budget, warranty, and delivery limits."
                actionText="Create Purchase Requirement"
                onAction={() => window.location.assign('/requirements/new')}
                className="border-none"
              />
            ) : (
              <div className="divide-y divide-[#E2EAE4]">
                {requirements.slice(0, 5).map((req) => {
                  const qCount = quotationsMap[req.id]?.length || 0;
                  const aCount = analysesMap[req.id]?.length || 0;
                  return (
                    <div
                      key={req.id}
                      className="p-4 sm:px-6 hover:bg-[#F5FBF7]/50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/requirements/${req.id}`}
                          className="font-semibold text-sm text-[#17211B] hover:text-emerald-700 transition-colors block truncate"
                        >
                          {req.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#647067]">
                          <span>Budget: {req.maxPrice ? formatCurrency(req.maxPrice) : 'Open'}</span>
                          <span>•</span>
                          <span>Delivery: {req.maxDeliveryDays ? `${req.maxDeliveryDays} days` : 'Any'}</span>
                          <span>•</span>
                          <span>Created: {formatDate(req.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-semibold text-gray-900 block">
                            {qCount} {qCount === 1 ? 'quote' : 'quotes'}
                          </span>
                          <span className="text-[11px] text-[#647067] block">
                            {aCount > 0 ? `${aCount} evaluated` : 'Not analyzed'}
                          </span>
                        </div>
                        <Link to={`/requirements/${req.id}`}>
                          <Button variant="outline" size="sm">
                            Inspect
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Launchpad & Workflow Guidance (1 Column) */}
        <div className="space-y-4">
          <Card title="Agentic Decision Workflow" subtitle="Standard AI evaluation process">
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Define Requirements</h4>
                  <p className="text-gray-500 mt-0.5">
                    Set price caps, quantity, delivery deadlines, and criteria weights (totaling 100%).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Upload Quotation PDFs</h4>
                  <p className="text-gray-500 mt-0.5">
                    Upload supplier PDFs. Gemini AI automatically extracts items, pricing, and terms.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Run AI Analysis</h4>
                  <p className="text-gray-500 mt-0.5">
                    Strict mandatory conditions check, followed by multi-criteria weighted scoring and risk warnings.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E2EAE4] space-y-2">
              <Link to="/requirements/new" className="block">
                <Button variant="primary" size="sm" className="w-full" icon={Plus}>
                  Create Requirement
                </Button>
              </Link>
              <Link to="/quotations/upload" className="block">
                <Button variant="outline" size="sm" className="w-full" icon={UploadCloud}>
                  Upload Quotation PDF
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
