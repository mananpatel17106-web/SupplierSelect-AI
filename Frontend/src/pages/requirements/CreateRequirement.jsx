import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createRequirementThunk } from '../../features/requirements/requirementSlice';
import { requirementSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Percent,
  Sliders,
  DollarSign,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRESETS = [
  { label: 'Standard Balance (50 / 30 / 20)', price: 50, delivery: 30, warranty: 20 },
  { label: 'Price Sensitive (60 / 25 / 15)', price: 60, delivery: 25, warranty: 15 },
  { label: 'Speed Critical (30 / 50 / 20)', price: 30, delivery: 50, warranty: 20 },
  { label: 'Quality & Longevity (35 / 25 / 40)', price: 35, delivery: 25, warranty: 40 },
];

const CreateRequirement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSubmitting } = useSelector((state) => state.requirements);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      title: '',
      description: '',
      quantity: '',
      maxPrice: '',
      maxDeliveryDays: '',
      minWarrantyYears: '',
      paymentTerms: 'Net 30 days upon inspection',
      priceWeight: 50,
      deliveryWeight: 30,
      warrantyWeight: 20,
    },
  });

  const priceWeight = Number(watch('priceWeight')) || 0;
  const deliveryWeight = Number(watch('deliveryWeight')) || 0;
  const warrantyWeight = Number(watch('warrantyWeight')) || 0;
  const totalWeight = priceWeight + deliveryWeight + warrantyWeight;
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const applyPreset = (preset) => {
    setValue('priceWeight', preset.price, { shouldValidate: true });
    setValue('deliveryWeight', preset.delivery, { shouldValidate: true });
    setValue('warrantyWeight', preset.warranty, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (!isWeightValid) {
      toast.error('The evaluation weights must total exactly 100%');
      return;
    }

    try {
      const result = await dispatch(createRequirementThunk(data)).unwrap();
      toast.success('Purchase requirement created successfully!');
      navigate(`/requirements/${result.id}`);
    } catch (err) {
      toast.error(err || 'Failed to create requirement');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/requirements">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#17211B]">Create Purchase Requirement</h2>
            <p className="text-xs text-[#647067]">
              Define conditions, mandatory constraints, and decision criteria weights.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card 1: Core Details */}
        <Card title="Requirement Details" subtitle="Basic specifications for the required goods or services">
          <div className="space-y-4">
            <Input
              label="Requirement Title / Product Name"
              placeholder="e.g. Industrial Grade Centrifugal Pump (Model CP-500)"
              required
              error={errors.title?.message}
              {...register('title')}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Technical Specifications / Description
              </label>
              <textarea
                rows={3}
                placeholder="Include specifications, materials, compliance standards, or manufacturer preferences..."
                className="block w-full rounded-lg border border-[#E2EAE4] p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Required Quantity (Units)"
                type="number"
                placeholder="e.g. 50"
                error={errors.quantity?.message}
                {...register('quantity')}
              />

              <Input
                label="Payment Terms"
                placeholder="e.g. Net 30 days upon inspection"
                error={errors.paymentTerms?.message}
                {...register('paymentTerms')}
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Mandatory Thresholds */}
        <Card
          title="Mandatory Supplier Conditions"
          subtitle="Suppliers violating these thresholds will be marked Ineligible"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Maximum Unit Price ($)"
              type="number"
              step="any"
              placeholder="e.g. 1500"
              helperText="Quoted price must not exceed this amount"
              error={errors.maxPrice?.message}
              {...register('maxPrice')}
            />

            <Input
              label="Max Delivery Time (Days)"
              type="number"
              placeholder="e.g. 30"
              helperText="Lead time must be within this timeframe"
              error={errors.maxDeliveryDays?.message}
              {...register('maxDeliveryDays')}
            />

            <Input
              label="Min Warranty (Years)"
              type="number"
              step="any"
              placeholder="e.g. 2"
              helperText="Minimum acceptable warranty coverage"
              error={errors.minWarrantyYears?.message}
              {...register('minWarrantyYears')}
            />
          </div>
        </Card>

        {/* Card 3: Multi-criteria Scoring Weights */}
        <Card
          title="Evaluation Criteria Weights"
          subtitle="Configured percentages used by QuoteWise AI scoring agent (Must sum to 100%)"
        >
          {/* Preset buttons */}
          <div className="mb-5">
            <span className="block text-xs font-semibold text-gray-700 mb-2">
              Select Preset Weight Profile:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-xs bg-[#F5FBF7] hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-[#E2EAE4] hover:border-emerald-300 rounded-lg px-3 py-1.5 transition-colors font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price Weight (%)"
              type="number"
              min="0"
              max="100"
              icon={DollarSign}
              error={errors.priceWeight?.message}
              {...register('priceWeight')}
            />

            <Input
              label="Delivery Weight (%)"
              type="number"
              min="0"
              max="100"
              icon={Clock}
              error={errors.deliveryWeight?.message}
              {...register('deliveryWeight')}
            />

            <Input
              label="Warranty Weight (%)"
              type="number"
              min="0"
              max="100"
              icon={Shield}
              error={errors.warrantyWeight?.message}
              {...register('warrantyWeight')}
            />
          </div>

          {/* Real-time Weight Sum Indicator */}
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-colors ${
              isWeightValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {isWeightValid ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>
                Total Configured Weight:{' '}
                <strong>{totalWeight}%</strong>
              </span>
            </div>
            <span>
              {isWeightValid
                ? 'Valid allocation (100%)'
                : `Weights must equal 100% (Current: ${totalWeight}%)`}
            </span>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/requirements">
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={!isWeightValid}
          >
            Save Purchase Requirement
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequirement;
