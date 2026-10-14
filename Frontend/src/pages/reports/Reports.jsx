import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequirements } from '../../features/requirements/requirementSlice';
import analysisService from '../../features/analysis/analysisService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatScore, formatCurrency } from '../../utils/formatters';

const ELIGIBILITY_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const Reports = () => {
  const dispatch = useDispatch();
  const { requirements } = useSelector((state) => state.requirements);

  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const generateReports = async () => {
      setIsLoading(true);
      try {
        const reqAction = await dispatch(fetchRequirements());
        const userRequirements = reqAction.payload || [];

        if (userRequirements.length > 0) {
          const promises = userRequirements.map((r) =>
            analysisService
              .getByRequirement(r.id)
              .then((res) => ({
                requirement: r,
                analyses: res.data || [],
              }))
              .catch(() => ({ requirement: r, analyses: [] }))
          );

          const results = await Promise.all(promises);
          setReportData(results);
        } else {
          setReportData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    generateReports();
  }, [dispatch]);

  if (isLoading) {
    return <Loader message="Compiling procurement analytics report..." />;
  }

  const allAnalyses = reportData.flatMap((r) => r.analyses);
  const totalAnalyzed = allAnalyses.length;

  const eligibleCount = allAnalyses.filter((a) => a.eligibilityStatus === 'eligible').length;
  const verificationCount = allAnalyses.filter(
    (a) => a.eligibilityStatus === 'needs_verification'
  ).length;
  const ineligibleCount = allAnalyses.filter(
    (a) => a.eligibilityStatus === 'ineligible'
  ).length;

  const complianceRate = totalAnalyzed > 0 ? Math.round((eligibleCount / totalAnalyzed) * 100) : 0;

  // Average scores for eligible suppliers
  const eligibleSuppliers = allAnalyses.filter((a) => a.eligibilityStatus === 'eligible');
  const avgTotalScore =
    eligibleSuppliers.length > 0
      ? eligibleSuppliers.reduce((sum, s) => sum + (s.totalScore || 0), 0) /
        eligibleSuppliers.length
      : 0;

  const avgPriceScore =
    eligibleSuppliers.length > 0
      ? eligibleSuppliers.reduce((sum, s) => sum + (s.priceScore || 0), 0) /
        eligibleSuppliers.length
      : 0;

  const avgDeliveryScore =
    eligibleSuppliers.length > 0
      ? eligibleSuppliers.reduce((sum, s) => sum + (s.deliveryScore || 0), 0) /
        eligibleSuppliers.length
      : 0;

  const avgWarrantyScore =
    eligibleSuppliers.length > 0
      ? eligibleSuppliers.reduce((sum, s) => sum + (s.warrantyScore || 0), 0) /
        eligibleSuppliers.length
      : 0;

  // Score comparison breakdown
  const criteriaBreakdownData = [
    { name: 'Average Total', score: Number(avgTotalScore.toFixed(1)) },
    { name: 'Average Price', score: Number(avgPriceScore.toFixed(1)) },
    { name: 'Average Delivery', score: Number(avgDeliveryScore.toFixed(1)) },
    { name: 'Average Warranty', score: Number(avgWarrantyScore.toFixed(1)) },
  ];

  const pieData = [
    { name: 'Eligible', value: eligibleCount },
    { name: 'Needs Verification', value: verificationCount },
    { name: 'Ineligible', value: ineligibleCount },
  ].filter((p) => p.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2EAE4]">
        <div>
          <h2 className="text-xl font-bold text-[#17211B]">Procurement Analytics & Reports</h2>
          <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
            Aggregated intelligence across all supplier submissions and AI decision outcomes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => window.print()}
        >
          Print / Export Report
        </Button>
      </div>

      {totalAnalyzed === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Available"
          description="Reports require at least one executed supplier analysis. Create requirements and upload quotation PDFs to view analytics."
        />
      ) : (
        <div className="space-y-6">
          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
              <span className="text-[11px] font-semibold text-[#647067] uppercase block">
                Total Submissions Evaluated
              </span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">
                {totalAnalyzed}
              </span>
              <span className="text-[11px] text-gray-500">Across {reportData.length} requirements</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
              <span className="text-[11px] font-semibold text-[#647067] uppercase block">
                Overall Compliance Rate
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {complianceRate}%
              </span>
              <span className="text-[11px] text-gray-500">Passed mandatory checks</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
              <span className="text-[11px] font-semibold text-[#647067] uppercase block">
                Average Winner Score
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {formatScore(avgTotalScore)}
              </span>
              <span className="text-[11px] text-gray-500">Eligible supplier benchmark</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2EAE4] shadow-2xs">
              <span className="text-[11px] font-semibold text-[#647067] uppercase block">
                Exclusion Rate
              </span>
              <span className="text-2xl font-black text-red-600 mt-1 block">
                {totalAnalyzed > 0 ? Math.round((ineligibleCount / totalAnalyzed) * 100) : 0}%
              </span>
              <span className="text-[11px] text-gray-500">Exceeded budget or lead times</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title="Average Criteria Performance"
              subtitle="Benchmark average score by evaluation factor"
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={criteriaBreakdownData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAE4" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#647067' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#647067' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.5rem',
                        border: '1px solid #E2EAE4',
                      }}
                    />
                    <Bar dataKey="score" name="Avg Score (0-100)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card
              title="Pipeline Compliance Breakdown"
              subtitle="Eligible vs. needs verification vs. ineligible quotation bids"
            >
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={ELIGIBILITY_COLORS[index % ELIGIBILITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} suppliers`, name]}
                      contentStyle={{
                        borderRadius: '0.5rem',
                        border: '1px solid #E2EAE4',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
