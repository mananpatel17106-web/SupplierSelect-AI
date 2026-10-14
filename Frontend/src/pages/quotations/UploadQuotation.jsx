import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequirements } from '../../features/requirements/requirementSlice';
import { uploadQuotationThunk, clearLatestUploadResult } from '../../features/quotations/quotationSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadQuotation = () => {
  const [searchParams] = useSearchParams();
  const preselectedRequirementId = searchParams.get('requirementId') || '';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { requirements, isLoading: reqLoading } = useSelector((state) => state.requirements);
  const { isUploading, uploadProgress, latestUploadResult } = useSelector(
    (state) => state.quotations
  );

  const [selectedRequirementId, setSelectedRequirementId] = useState(preselectedRequirementId);
  const [supplierName, setSupplierName] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchRequirements());
    return () => {
      dispatch(clearLatestUploadResult());
    };
  }, [dispatch]);

  useEffect(() => {
    if (preselectedRequirementId) {
      setSelectedRequirementId(preselectedRequirementId);
    } else if (requirements && requirements.length === 1 && !selectedRequirementId) {
      setSelectedRequirementId(String(requirements[0].id));
    }
  }, [preselectedRequirementId, requirements, selectedRequirementId]);

  const validateFile = (selectedFile) => {
    setFileError('');
    if (!selectedFile) return false;

    if (selectedFile.type !== 'application/pdf') {
      setFileError('Only PDF quotation documents are supported by the extraction service.');
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError('File size exceeds the 10MB limit.');
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRequirementId) {
      toast.error('Please select a purchase requirement');
      return;
    }

    if (!supplierName.trim()) {
      toast.error('Please enter the supplier name');
      return;
    }

    if (!file) {
      toast.error('Please select a PDF quotation file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('quotation', file);
    formData.append('requirementId', selectedRequirementId);
    formData.append('supplierName', supplierName.trim());

    try {
      toast.loading('Uploading and processing PDF with AI...', { id: 'upload-toast' });
      const actionResult = await dispatch(
        uploadQuotationThunk({
          formData,
          onProgress: (p) => {
            // progress handled in slice
          },
        })
      ).unwrap();

      toast.success('Quotation uploaded and parsed successfully!', { id: 'upload-toast' });
    } catch (err) {
      toast.error(err || 'Failed to upload quotation', { id: 'upload-toast' });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/quotations">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Quotations
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#17211B]">Upload Supplier Quotation</h2>
          <p className="text-xs text-[#647067]">
            Upload a supplier quotation PDF. Gemini AI will automatically extract items, pricing, and terms.
          </p>
        </div>
      </div>

      {/* Warning Banner if No Requirements exist */}
      {!reqLoading && requirements && requirements.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-900 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">
              No Purchase Requirements Found
            </h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Every quotation must be linked to a specific Purchase Requirement (e.g. required product, quantity, target budget, delivery deadline) so QuoteWise AI can evaluate compliance and rank suppliers.
            </p>
            <div className="mt-3">
              <Link to="/requirements/new">
                <Button variant="primary" size="sm">
                  + Create Purchase Requirement First
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Requirement Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Related Purchase Requirement <span className="text-red-500">*</span>
              </label>
              <Link
                to="/requirements/new"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
              >
                + New Requirement
              </Link>
            </div>
            <select
              value={selectedRequirementId}
              onChange={(e) => setSelectedRequirementId(e.target.value)}
              disabled={isUploading}
              className="block w-full rounded-lg border border-[#E2EAE4] p-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
            >
              <option value="" disabled>
                {requirements && requirements.length === 0
                  ? 'No requirements found — create one first'
                  : 'Select a requirement...'}
              </option>
              {(requirements || []).map((req) => (
                <option key={req.id} value={req.id}>
                  {req.title} {req.maxPrice ? `(Budget: $${req.maxPrice})` : ''}
                </option>
              ))}
            </select>
            {requirements && requirements.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-700 font-medium">
                Please create a purchase requirement first before uploading quotations.
              </p>
            )}
          </div>


          {/* Supplier Name */}
          <Input
            label="Supplier / Vendor Name"
            placeholder="e.g. Apex Industrial Solutions Ltd."
            icon={Building}
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            disabled={isUploading}
            required
          />

          {/* PDF Drag & Drop Dropzone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Quotation PDF Document <span className="text-red-500">*</span>
            </label>

            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-[#E2EAE4] hover:border-emerald-500 bg-[#F5FBF7]/30 hover:bg-[#F5FBF7]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Click to select file or drag & drop here
                </p>
                <p className="text-xs text-[#647067] mt-1">
                  Supported format: <strong>PDF only</strong> (Max file size: 10 MB)
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-[#17211B] truncate">{file.name}</p>
                    <p className="text-xs text-[#647067]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {fileError && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{fileError}</span>
              </p>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex justify-between text-xs font-semibold text-emerald-900">
                <span>Uploading & Processing with AI...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-emerald-700">
                Parsing document text and extracting procurement items via Gemini AI...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#E2EAE4] space-y-2">
            <div className="flex items-center justify-end gap-3">
              <Link to="/quotations">
                <Button variant="outline" size="md" disabled={isUploading}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUploading}
                disabled={!file || !supplierName || !selectedRequirementId}
                icon={UploadCloud}
              >
                Upload Quotation
              </Button>
            </div>
            {(!selectedRequirementId || !supplierName || !file) && (
              <p className="text-[11px] text-gray-500 text-right">
                {!selectedRequirementId
                  ? requirements && requirements.length === 0
                    ? '⚠️ Please create a purchase requirement first before uploading.'
                    : '⚠️ Please select a purchase requirement from the dropdown above.'
                  : !supplierName.trim()
                  ? '⚠️ Please enter supplier / vendor name.'
                  : '⚠️ Please select a PDF quotation file to upload.'}
              </p>
            )}
          </div>
        </form>
      </Card>

      {/* Post-Upload Extraction Summary Card */}
      {latestUploadResult && (
        <Card
          title="AI Document Processing Results"
          subtitle={`Quotation for ${latestUploadResult.quotation?.supplierName} parsed`}
          headerAction={
            latestUploadResult.processing?.status === 'processing_failed' ? (
              <Badge variant="danger">Extraction Incomplete</Badge>
            ) : latestUploadResult.processing?.status === 'needs_verification' ? (
              <Badge variant="warning">Verification Needed</Badge>
            ) : (
              <Badge variant="success">Successfully Processed</Badge>
            )
          }
        >

          <div className="space-y-4">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">AI Extraction Completed</p>
                <p className="text-emerald-800 mt-0.5">
                  Extracted from file:{' '}
                  <strong>{latestUploadResult.quotation?.fileName}</strong> (
                  {latestUploadResult.processing?.pages || 1} pages).
                </p>
              </div>
            </div>

            {latestUploadResult.processing?.items && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Extracted Items ({latestUploadResult.processing.items.length}):
                </h4>
                <div className="space-y-2">
                  {latestUploadResult.processing.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-[#E2EAE4] bg-white text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-gray-900 block">
                          {item.productName || 'General Item'}
                        </span>
                        <span className="text-gray-500">
                          Qty: {item.quantity || '—'} • Delivery: {item.deliveryDays ? `${item.deliveryDays} days` : '—'} • Warranty: {item.warrantyYears ? `${item.warrantyYears} yrs` : '—'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-emerald-700">
                        ${item.unitPrice ? item.unitPrice.toLocaleString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  dispatch(clearLatestUploadResult());
                  handleRemoveFile();
                  setSupplierName('');
                }}
              >
                Upload Another Quotation
              </Button>
              <Link to={`/requirements/${selectedRequirementId}`}>
                <Button variant="primary" size="sm">
                  View Requirement & Run Analysis
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UploadQuotation;
