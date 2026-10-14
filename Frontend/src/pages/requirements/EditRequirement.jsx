import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRequirementById,
  updateRequirementThunk,
} from '../../features/requirements/requirementSlice';
import { requirementSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditRequirement = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentRequirement, isLoading, isSubmitting } = useSelector(
    (state) => state.requirements
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
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
      paymentTerms: '',
      priceWeight: 50,
      deliveryWeight: 30,
      warrantyWeight: 20,
    },
  });

  useEffect(() => {
    dispatch(fetchRequirementById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentRequirement) {
      reset({
        title: currentRequirement.title || '',
        description: currentRequirement.description || '',
        quantity: currentRequirement.quantity ?? '',
        maxPrice: currentRequirement.maxPrice ?? '',
        maxDeliveryDays: currentRequirement.maxDeliveryDays ?? '',
        minWarrantyYears: currentRequirement.minWarrantyYears ?? '',
        paymentTerms: currentRequirement.paymentTerms || '',
        priceWeight: currentRequirement.priceWeight ?? 50,
        deliveryWeight: currentRequirement.deliveryWeight ?? 30,
        warrantyWeight: currentRequirement.warrantyWeight ?? 20,
      });
    }
  }, [currentRequirement, reset]);

  const priceWeight = Number(watch('priceWeight')) || 0;
  const deliveryWeight = Number(watch('deliveryWeight')) || 0;
  const warrantyWeight = Number(watch('warrantyWeight')) || 0;
  const totalWeight = priceWeight + deliveryWeight + warrantyWeight;
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const onSubmit = async (data) => {
    if (!isWeightValid) {
      toast.error('The evaluation weights must total exactly 100%');
      return;
    }

    try {
      await dispatch(
        updateRequirementThunk({ id: Number(id), data })
      ).unwrap();
      toast.success('Purchase requirement updated successfully!');
      navigate(`/requirements/${id}`);
    } catch (err) {
      toast.error(err || 'Failed to update requirement');
    }
  };

  if (isLoading && !currentRequirement) {
    return <Loader message="Loading requirement details..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/requirements/${id}`}>
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#17211B]">Edit Purchase Requirement</h2>
            <p className="text-xs text-[#647067]">
              Update thresholds and criteria weights for #{id}.
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
                className="block w-full rounded-lg border border-[#E2EAE4] p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Required Quantity (Units)"
                type="number"
                error={errors.quantity?.message}
                {...register('quantity')}
              />

              <Input
                label="Payment Terms"
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
              error={errors.maxPrice?.message}
              {...register('maxPrice')}
            />

            <Input
              label="Max Delivery Time (Days)"
              type="number"
              error={errors.maxDeliveryDays?.message}
              {...register('maxDeliveryDays')}
            />

            <Input
              label="Min Warranty (Years)"
              type="number"
              step="any"
              error={errors.minWarrantyYears?.message}
              {...register('minWarrantyYears')}
            />
          </div>
        </Card>

        {/* Card 3: Evaluation Weights */}
        <Card
          title="Evaluation Criteria Weights"
          subtitle="Weights must total exactly 100%"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price Weight (%)"
              type="number"
              icon={DollarSign}
              error={errors.priceWeight?.message}
              {...register('priceWeight')}
            />

            <Input
              label="Delivery Weight (%)"
              type="number"
              icon={Clock}
              error={errors.deliveryWeight?.message}
              {...register('deliveryWeight')}
            />

            <Input
              label="Warranty Weight (%)"
              type="number"
              icon={Shield}
              error={errors.warrantyWeight?.message}
              {...register('warrantyWeight')}
            />
          </div>

          <div
            className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
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
              <span>Total Weight: {totalWeight}%</span>
            </div>
            <span>
              {isWeightValid ? 'Valid 100%' : 'Must equal 100%'}
            </span>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to={`/requirements/${id}`}>
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditRequirement;
